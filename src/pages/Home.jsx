import React from "react";
import Content from "../components/home/Content";
import Suggestions from "../components/home/Suggestions";

const Home = () => {
  return (
    <>
      <div className="row" style={{ marginTop: "20px", marginBottom: "20px" }}>
        {/* Center column (Content) */}
        <div className="col-12 col-md-8">
          <Content />
        </div>

        {/* Right column (Suggestion) */}
        <div
          className="col-md-3 d-none d-md-block border-start"
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            overflowY: "auto",
            background: "white",
            zIndex: 1000,
          }}
        >
          <Suggestions />
        </div>
      </div>
    </>
  );
};

export default Home;
