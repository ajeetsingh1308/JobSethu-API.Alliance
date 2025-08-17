import React from "react";
import Card from "./Card";
function Header({ seljob, alljob }) {
  return (
    <div>
      <div className="px-10 py-6 flex items-center gap-7 ">
        <Card title="Event selected" color="blue" count={props.seljob} />
        <Card title="All events" color="blue" count={props.alljob} />
        <Card
          title="Featured Events"
          color="blue"
          count={props.Events.length}
        />
      </div>
    </div>
  );
}

export default Header;
