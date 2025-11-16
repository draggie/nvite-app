import { useQuery } from 'react-query'
import axios from 'axios'

export const useUserList = () =>
    useQuery('userList', async () => {
        const response = await axios.get('/list')
        return response.data
    })
