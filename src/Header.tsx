import { Toolbar } from "primereact/toolbar";
import React from "react";

const Header = () => {
  const leftContents = (
    <React.Fragment>
      <h3>Mapowacz pakowaczy prezentów</h3>
    </React.Fragment>
  );

  return (
    <div>
      <Toolbar left={leftContents} />
    </div>
  );
};

export default Header;
