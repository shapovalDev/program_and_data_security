import React from "react";
import { connect } from "react-redux";
import "./style.css";

const Loader = ({ loading }) => {
  return (
    <>
      {loading && (
        <div className="loader-wrapper">
          <div className="loader">Loading</div>
        </div>
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  loading: state.user.loading,
});

export default connect(mapStateToProps, null)(Loader);
