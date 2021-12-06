import { ListBox } from "primereact/listbox";
import { useEffect, useState } from "react";
import axios from "axios";

export interface IUser {
  id: number;
  name: string;
}

interface IListPicker {
  onConfirm: (user: IUser) => void;
  selectedUser: IUser;
}
const ListPicker = (props: IListPicker) => {
  useEffect(() => {
    (async () => {
      const response = await axios.get(
        "https://nvite-api.azurewebsites.net/list"
      );
      if (response.status === 200) {
        setUserList(response.data);
      }
    })();
  }, []);

  const [userList, setUserList] = useState<IUser[]>([]);

  return (
    <ListBox
      value={props.selectedUser}
      options={userList}
      onChange={(e) => props.onConfirm(e.value)}
      optionLabel="name"
      style={{ width: "15rem" }}
    />
  );
};

export default ListPicker;
