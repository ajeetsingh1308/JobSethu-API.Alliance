// src/components/JobCard.jsx

import { MapPin, IndianRupee, Clock } from 'lucide-react';

const JobCard = ({ job, onClick }) => {
  const { id, title, description, location, amount, skills_required, image_url, posted_days_ago, status } = job;
  const isUrgent = status === 'SOS';

  return (
    <div
      className="relative flex flex-col rounded-xl overflow-hidden shadow-lg bg-gray-800 text-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer"
      onClick={() => onClick(id)}
    >
      {/* Job Image */}
      <div className="relative h-48 w-full">
        {image_url && (
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
        {isUrgent && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            ⚠️ URGENT
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col justify-between h-full">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
          <div className="flex items-center text-sm text-gray-400 mb-2">
            <MapPin size={16} className="mr-1" />
            <span>{location}</span>
          </div>
          <p className="text-sm text-gray-400 mb-4 line-clamp-3">{description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {skills_required.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-600 text-xs font-medium px-2 py-1 rounded-full text-white"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Footer with Payment and Time */}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-700">
          <div className="flex items-center text-green-400 font-bold">
            <IndianRupee size={16} className="mr-1" />
            <span>{amount}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Clock size={16} className="mr-1" />
            <span>{posted_days_ago}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;