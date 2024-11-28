import React from "react";
import SuggestionCard from "./SuggestionCard";
import "./suggestion.css";

const Suggestions = () => {
  return (
    <div className="">
      <h5 className="mb-4 mt-2 pt-1 m-font sticky-top">Suggested for you</h5>
      <div className="Suggestions-box">
        <SuggestionCard />
      </div>
    </div>
  );
};

export default Suggestions;
