import {Card} from "primereact/card";
import {Button} from "primereact/button";
import {Image} from "primereact/image";
import React, {FC} from "react";
import {IStep} from "../interfaces/util";

export const InitialResultStep: FC<IStep> = ({onNext}) => {
    return  <Card
        title="Losowanie zakonczone"
        footer={
            <Button onClick={() => onNext()}>
                Pokaż kogo wylosowała zaczarowana kula
            </Button>
        }
    >
        <Image src={"/ball.png"} />
    </Card>
}
