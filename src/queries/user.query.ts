import { useQuery } from 'react-query'
import axios from 'axios'

export const useUserList = () =>
    useQuery('userList', async () => {
        const response = await axios.get('https://nvite-api.azurewebsites.net/list')
        return response.data
    })
