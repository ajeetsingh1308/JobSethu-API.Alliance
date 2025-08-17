import React from "react";
import { useState } from "react";
import { Calendar } from "lucide-react";

import EventCard from "./components/EventCard";
import AddEventModal from "./components/AddEvent";
import Card from "./components/Card";
import ProjectsSection from "./components/Projects";
import Navigation from "./components/Navigation";
import Header from "./components/Header";

function App() {
  const [showModal, setShowModal] = useState(false);

  const [count, setCount] = useState(0);

  const [selectedEvent, setSelectedEvent] = useState([]);

  const addEvent = (eventData) => {
    setEvents((prevEvents) => [...prevEvents, eventData]);
    setShowModal(false); // Close modal after adding event
  };

  const [Events, setEvents] = useState([
    {
      title: "Simple Website for a Local Cafe",
      description:
        "Need a student to build a one-page responsive website using basic HTML/CSS. No complex backend needed, just a simple, attractive online presence.",

      venue: "Panjim, Goa",
      payment: "2000",
    },
    {
      title: "Help with Garden Maintenance",
      description:
        "Looking for a student to help with basic gardening tasks like watering plants, weeding, and clearing leaves for a few hours. Very urgent for the weekend.",

      venue: "Margao, Goa",
      payment: "500",
    },
    {
      title: "Volunteer for College Fest",
      description:
        "Need enthusiastic volunteers for our annual college festival. Tasks include registration desk, coordinating events, and managing stalls. Great experience!",
      venue: "Mapusa, Goa",
      payment: "1200",
    },
    {
      title: "Write Content for a Travel Blog",
      description:
        "Seeking a student to write 3 short blog posts about tourist spots in Goa. Each post should be 500 words. Good writing skills are a must.",

      venue: "Vasco, Goa",
      payment: "1000",
    },
  ]);

  const selectEvent = (title) => {
    if (!selectedEvent.includes(title)) {
      console.log("Event selected:", title);
      // Increment count and add to selected events
      setCount(count + 1);
      setSelectedEvent([...selectedEvent, title]);
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 text-gray-800">
      {/*<Navigation />*/}
      <div className="w-full border-b-5 border-blue-500 h-28 px-9 flex items-center justify-between">
        <div>
          <p className="text-3xl text-blue-700 font-bold flex items-center gap-2">
            <Calendar className="text-blue-500" />
            Job Sethu
          </p>
          <p className="text-md  text-gray-900">
            Bridging Skills with Opportunities
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
          >
            + Add Event
          </button>
        </div>
      </div>
      <div>
        <div className="px-10 py-6 flex items-center gap-7 ">
          <Card
            title="Registered Jobs"
            color="blue"
            count={selectedEvent.length}
          />
          <Card title="All Jobs" color="blue" count={Events.length} />

          {/*<Card title="Featured Events" color="blue" count={Events.length} />*/}
        </div>
      </div>
      <div className="flex items-center justify-start flex-wrap gap-4 py-16 px-10">
        {Events.map((event, index) => (
          <EventCard
            key={index}
            title={event.title}
            description={event.description}
            venue={event.venue}
            payment={event.payment}
            selectEvent={selectEvent}
          />
        ))}
      </div>

      <AddEventModal
        show={showModal}
        onClose={() => setShowModal(false)}
        setData={addEvent} // Send helper function
      />
    </div>
  );
}

export default App;
