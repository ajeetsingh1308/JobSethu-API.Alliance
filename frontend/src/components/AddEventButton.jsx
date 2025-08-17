import React from "react";

// The component accepts an `onClick` prop.
const AddEventButton = ({ onClick }) => {
  return (
    <button
      // This onClick now calls the function passed down from the parent.
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
    >
      + Add Event
    </button>
  );
};

export default AddEventButton;
