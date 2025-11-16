import { useMutation } from 'react-query'
import axios from 'axios'
import { IUser } from '../ListPicker'

export const useSelectRandom = (id: number) => {
    return useMutation(async () => {
        return await axios.post<IUser>('/lottery/' + id)
    })
}
