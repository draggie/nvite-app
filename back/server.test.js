// @ts-check
const request = require('supertest')

// Mock Firebase Admin before requiring server
const mockRef = {
    once: jest.fn(),
    set: jest.fn(),
}

const mockDatabase = {
    ref: jest.fn((path) => mockRef),
}

const mockAdmin = {
    initializeApp: jest.fn(),
    credential: {
        cert: jest.fn(),
    },
    database: jest.fn(() => mockDatabase),
}

jest.mock('firebase-admin', () => mockAdmin)

// Mock dotenv
jest.mock('dotenv', () => ({
    config: jest.fn(),
}))

// Set up environment variables
process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
    type: 'service_account',
    project_id: 'test-project',
    private_key_id: 'test-key-id',
    private_key: '-----BEGIN PRIVATE KEY-----\\ntest\\n-----END PRIVATE KEY-----\\n',
    client_email: 'test@test.iam.gserviceaccount.com',
    client_id: '123456789',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
})
process.env.FIREBASE_DATABASE_URL = 'https://test-project.firebaseio.com'

// Mock the util module
const mockRandomInt = jest.fn((min, max) => min) // Return first available index for deterministic testing
jest.mock('./util', () => ({
    randomIntFromInterval: mockRandomInt,
}))

// Test data
const testList = [
    { id: 1, name: 'Halina Roszak', groupId: 1 },
    { id: 2, name: 'Ada Razik', groupId: 2 },
    { id: 3, name: 'Kamila Zawadzka', groupId: 3 },
    { id: 4, name: 'Robert Zawadzki', groupId: 4 },
    { id: 5, name: 'Maciek', groupId: 3 },
    { id: 6, name: 'Magdalena Zawadzka', groupId: 4 },
]

// Initial mapped data (array format as shown in the export)
// Index 2 -> actor id 2 mapped to target id 5
// Index 3 -> actor id 3 mapped to target id 2
// Index 5 -> actor id 5 mapped to target id 4
const initialMapped = [
    null,
    null,
    { id: 5, name: 'Maciek', groupId: 3 },
    { id: 2, name: 'Ada Razik', groupId: 2 },
    null,
    { id: 4, name: 'Robert Zawadzki', groupId: 4 },
]

describe('Lottery API Tests', () => {
    let app
    let testMapped

    beforeEach(async () => {
        // Reset all mocks
        jest.clearAllMocks()
        testMapped = [...initialMapped] // Start with initial state

        // Set up Firebase mocks
        mockDatabase.ref.mockImplementation((path) => {
            if (path === '/list') {
                mockRef.once.mockResolvedValue({
                    val: () => testList,
                })
                return mockRef
            }
            if (path === '/mapped') {
                mockRef.once.mockResolvedValue({
                    val: () => [...testMapped], // Return current state
                })
                mockRef.set.mockImplementation((newMapped) => {
                    testMapped = [...newMapped] // Update state
                    return Promise.resolve()
                })
                return mockRef
            }
            return mockRef
        })

        // Mock randomIntFromInterval to return first available
        mockRandomInt.mockImplementation((min, max) => min)

        // Clear module cache and create fresh app
        jest.resetModules()
        const serverModule = require('./server')
        app = await serverModule.createApp()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('GET /list', () => {
        it('should return the list of all users', async () => {
            const response = await request(app).get('/list')
            expect(response.status).toBe(200)
            expect(response.body).toEqual(testList)
            expect(response.body).toHaveLength(6)
        })
    })

    describe('POST /lottery/:id', () => {
        it('should return 404 for non-existent user id', async () => {
            const response = await request(app).post('/lottery/999')
            expect(response.status).toBe(404)
        })

        it('should return 412 if lottery already completed for user id 2', async () => {
            const response = await request(app).post('/lottery/2')
            expect(response.status).toBe(412)
            expect(response.body.error).toBe('Lottery already completed for this user')
            expect(response.body.result).toEqual({ id: 5, name: 'Maciek', groupId: 3 })
        })

        it('should return 412 if lottery already completed for user id 3', async () => {
            const response = await request(app).post('/lottery/3')
            expect(response.status).toBe(412)
            expect(response.body.error).toBe('Lottery already completed for this user')
            expect(response.body.result).toEqual({ id: 2, name: 'Ada Razik', groupId: 2 })
        })

        it('should return 412 if lottery already completed for user id 5', async () => {
            const response = await request(app).post('/lottery/5')
            expect(response.status).toBe(412)
            expect(response.body.error).toBe('Lottery already completed for this user')
            expect(response.body.result).toEqual({ id: 4, name: 'Robert Zawadzki', groupId: 4 })
        })

        it('should successfully run lottery for user id 1', async () => {
            // User 1 (groupId: 1) should not get:
            // - User 1 (self)
            // - User 2, 3, 5 (already mapped as targets)
            // - Users with groupId 1 (same group - but only user 1 has groupId 1)
            // Available: User 4 (groupId: 4), User 6 (groupId: 4)
            // Since randomIntFromInterval is mocked to return min, it will pick first available (User 4)

            const response = await request(app).post('/lottery/1')
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('id')
            expect(response.body).toHaveProperty('name')
            expect(response.body).toHaveProperty('groupId')
            // Should not be user 1 (self)
            expect(response.body.id).not.toBe(1)
            // Should not be already mapped targets (2, 3, 5)
            expect([2, 3, 5]).not.toContain(response.body.id)
            // Should not be same group (groupId: 1)
            expect(response.body.groupId).not.toBe(1)
            // Should be one of the available users (4 or 6)
            expect([4, 6]).toContain(response.body.id)
        })

        it('should successfully run lottery for user id 4', async () => {
            // User 4 (groupId: 4) should not get:
            // - User 4 (self)
            // - User 2, 3, 5 (already mapped as targets)
            // - User 6 (same groupId: 4)
            // Available: User 1 (groupId: 1)
            // So only User 1 is available

            const response = await request(app).post('/lottery/4')
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('id')
            expect(response.body.id).toBe(1) // Only user 1 is available
            expect(response.body.name).toBe('Halina Roszak')
            expect(response.body.groupId).toBe(1)
        })

        it('should successfully run lottery for user id 6', async () => {
            // User 6 (groupId: 4) should not get:
            // - User 6 (self)
            // - User 2, 3, 5 (already mapped as targets)
            // - User 4 (same groupId: 4)
            // Available: User 1 (groupId: 1)

            const response = await request(app).post('/lottery/6')
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('id')
            expect(response.body.id).toBe(1) // Only user 1 is available
            expect(response.body.name).toBe('Halina Roszak')
            expect(response.body.groupId).toBe(1)
        })

        it('should exclude self, same group, and already mapped targets', async () => {
            const response = await request(app).post('/lottery/1')
            
            expect(response.status).toBe(200)
            const result = response.body
            // Should not be self
            expect(result.id).not.toBe(1)
            // Should not be same group
            expect(result.groupId).not.toBe(1)
            // Should not be already mapped targets
            expect([2, 3, 5]).not.toContain(result.id)
        })

        it('should save the mapping to Firebase after successful lottery', async () => {
            // Reset mapped state
            testMapped = [null, null, null, null, null, null]
            
            const response = await request(app).post('/lottery/1')
            
            expect(response.status).toBe(200)
            // Verify that set was called
            expect(mockRef.set).toHaveBeenCalled()
            const savedData = mockRef.set.mock.calls[0][0]
            expect(Array.isArray(savedData)).toBe(true)
            // Check that user 1's mapping was saved
            expect(savedData[1]).toEqual(response.body)
        })
    })

    describe('Lottery for all users', () => {
        it('should allow lottery for all users in sequence', async () => {
            // Start with empty mapped array
            testMapped = [null, null, null, null, null, null]
            
            const userIds = [1, 2, 3, 4, 5, 6]
            const results = {}

            for (const userId of userIds) {
                // Reset mocks for each iteration
                jest.clearAllMocks()
                mockDatabase.ref.mockImplementation((path) => {
                    if (path === '/list') {
                        mockRef.once.mockResolvedValue({
                            val: () => testList,
                        })
                        return mockRef
                    }
                    if (path === '/mapped') {
                        mockRef.once.mockResolvedValue({
                            val: () => [...testMapped],
                        })
                        mockRef.set.mockImplementation((newMapped) => {
                            testMapped = [...newMapped]
                            return Promise.resolve()
                        })
                        return mockRef
                    }
                    return mockRef
                })
                mockRandomInt.mockImplementation((min, max) => min)

                // Clear module cache and create fresh app for each request
                jest.resetModules()
                const serverModule = require('./server')
                const testApp = await serverModule.createApp()

                const response = await request(testApp).post(`/lottery/${userId}`)
                
                if (response.status === 412) {
                    // Already completed, skip
                    console.log(`User ${userId} already has a mapping`)
                    continue
                }

                expect(response.status).toBe(200)
                expect(response.body).toHaveProperty('id')
                expect(response.body).toHaveProperty('name')
                expect(response.body).toHaveProperty('groupId')
                
                // Verify constraints
                expect(response.body.id).not.toBe(userId) // Not self
                
                const actor = testList.find(u => u.id === userId)
                expect(response.body.groupId).not.toBe(actor.groupId) // Not same group
                
                results[userId] = response.body
            }

            // Verify all users got different targets (if all succeeded)
            const targetIds = Object.values(results).map(r => r.id)
            const uniqueTargetIds = [...new Set(targetIds)]
            expect(uniqueTargetIds.length).toBe(targetIds.length) // All targets should be unique
        })

        it('should work correctly for user id 6 with initial mapped state', async () => {
            // This is the specific case mentioned by the user
            // With initial mapped state, user 6 should be able to run lottery
            testMapped = [...initialMapped]

            const response = await request(app).post('/lottery/6')
            
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('id')
            expect(response.body.id).not.toBe(6) // Not self
            expect(response.body.groupId).not.toBe(4) // Not same group
            // Should not be already mapped targets (2, 3, 5)
            expect([2, 3, 5]).not.toContain(response.body.id)
            // Available options: User 1 (groupId: 1)
            expect(response.body.id).toBe(1)
        })
    })
})
