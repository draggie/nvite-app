import { ListBox } from 'primereact/listbox'
import { useUserList } from './queries/user.query'
import { ProgressSpinner } from 'primereact/progressspinner'

export interface IUser {
    id: number
    name: string
}

interface IListPicker {
    onConfirm: (user: IUser) => void
    selectedUser: IUser
}
const ListPicker = (props: IListPicker) => {
    const userList = useUserList()

    return userList.isLoading ? (
        <ProgressSpinner />
    ) : (
        <ListBox
            value={props.selectedUser}
            options={userList.data}
            onChange={e => props.onConfirm(e.value)}
            optionLabel='name'
            style={{ width: '15rem' }}
        />
    )
}

export default ListPicker
