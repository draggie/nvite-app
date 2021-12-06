import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import Header from "./Header";
import { Card } from "primereact/card";
import ListPicker, { IUser } from "./ListPicker";
import { Button } from "primereact/button";
import axios from "axios";
import { ProgressSpinner } from "primereact/progressspinner";
import { Image } from "primereact/image";
import { Toast } from "primereact/toast";

function App() {
  const toast = useRef<Toast | null>(null);
  const magic = localStorage.getItem("magic");
  const [selectedUser, setSelectedUser] = useState<IUser>();
  const [randomTarget, setRandomTarget] = useState<IUser>();
  const [showResult, setShowResult] = useState(false);
  const [showRealResult, setShowRealResult] = useState(false);
  const [showRealRealResult, setShowRealRealResult] = useState(false);
  const [showRealFuckingResult, setShowRealFuckingResult] = useState(false);
  const [timer, setTimer] = useState(30);

  const [startTimer, setStartTimer] = useState(false);

  useEffect(() => {
    if (showRealFuckingResult) {
      (async () => {
        setStartTimer(true);
      })();
    }
  }, [showRealFuckingResult]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (startTimer) {
      t = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    }

    if (timer === 0) {
      setStartTimer(false);
      localStorage.setItem("magic", "true");
    }

    return () => clearInterval(t);
  }, [startTimer, timer]);

  const pickRandomTarget = async () => {
    try {
      const result = await axios.post(
        "https://nvite-api.azurewebsites.net/lottery/" + selectedUser?.id
      );
      if (result.status === 200) {
        setRandomTarget(result.data);
        setTimeout(() => {
          setShowResult(true);
        }, 5000);
      }
    } catch (er) {
      toast.current?.show({
        severity: "error",
        summary: "Oj nie ładnie",
        detail: "Oszukiwać tak!!!",
      });
    }
  };

  if (magic) return <h1>APLIKACJA ZNISZCZONA</h1>;

  return (
    <div className="App">
      <Header />
      <div className="p-d-flex p-d-row p-ai-center p-jc-center p-mt-5">
        {!randomTarget && (
          <Card
            title="Wybierz siebie z listy"
            footer={
              <Button
                disabled={!selectedUser}
                type="button"
                onClick={pickRandomTarget}
                className="p-mt-2"
              >
                Zatwierdź
              </Button>
            }
            style={{ width: "25rem", marginBottom: "2em" }}
          >
            <div className="p-d-flex p-jc-center">
              <ListPicker
                selectedUser={selectedUser as IUser}
                onConfirm={setSelectedUser}
              />
            </div>
          </Card>
        )}
        {randomTarget && !showResult && (
          <div className="p-d-flex p-flex-column p-jc-center p-ai-center">
            Trwa nagrzewanie kryształowej kuli ...
            <ProgressSpinner />
          </div>
        )}
        {randomTarget && showResult && !showRealResult && (
          <Card
            title="Losowanie zakonczone"
            footer={
              <Button onClick={() => setShowRealResult(true)}>
                Pokaż kogo wylosowała zaczarowana kula
              </Button>
            }
          >
            <Image src={"/ball.png"} />
          </Card>
        )}
        {showRealResult && !showRealRealResult && (
          <Card
            title="Czy na pewno ?"
            footer={
              <div className="p-d-flex p-flex-column p-ai-center">
                <Button
                  className="p-mb-2"
                  onClick={() => setShowRealRealResult(true)}
                >
                  Tak, na pewno chcę poznać wynik
                </Button>
                <Button onClick={() => setShowRealRealResult(true)}>
                  Nie, musze przemyśleć swoje życie
                </Button>
              </div>
            }
          ></Card>
        )}
        {showRealRealResult && !showRealFuckingResult && (
          <Card
            title="Ale dasz sobie rękę uciąć, że chcesz poznać wynik ?"
            footer={
              <div className="p-d-flex p-flex-column p-ai-center">
                <Button
                  className="p-mb-2"
                  onClick={() => setShowRealFuckingResult(true)}
                >
                  Tak
                </Button>
                <Button
                  className="p-mb-2"
                  onClick={() => setShowRealFuckingResult(true)}
                >
                  Nie wiem
                </Button>
                <Button
                  className="p-mb-2"
                  onClick={() => setShowRealFuckingResult(true)}
                >
                  Chcę do domu
                </Button>
                <Button onClick={() => setShowRealFuckingResult(true)}>
                  Tak ty jebany programie
                </Button>
              </div>
            }
          ></Card>
        )}
        {showRealFuckingResult && (
          <Card title="No dobra, po co ta agresja">
            Twój wynik to: {randomTarget?.name}
            <br />
            Lepiej go zapisz, bo ta aplikacja ulegnie samozniszczeniu za:
            <b>{timer} s</b>
          </Card>
        )}
      </div>

      <Toast ref={toast} />
    </div>
  );
}

export default App;
