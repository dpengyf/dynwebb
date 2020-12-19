import React from "react";
import { useHistory, Redirect } from "react-router-dom";
import "../../styles/creategame.css";
import "../../styles/base.css";

let count = 0;

const SearchFormResultView = ({ searchResults, setCurrentTrack, token }) => {
  let history = useHistory();

  return (
    <div>
      {token === undefined ? (
        <Redirect to="/login" />
      ) : (
        <section>
          <div className="album py-3 bg-light">
            <div className="container">
              <div className="row">
                {searchResults ? (
                  searchResults.map((track) => (
                    <div className="col-md-4" key={count++}>
                      <div
                        className="card mb-3 shadow cardHover"
                        key={track.id}
                        onClick={() => {
                          history.push({
                            pathname: "/details",
                          });
                          setCurrentTrack(track);
                        }}
                      >
                        <img
                          className="card-img-top"
                          src={track.album.images[0].url}
                          alt="Album Cover"
                        ></img>
                        <div className="card-body">
                          <small className="card-text">
                            <b>{track.name}</b>
                          </small>
                          <br />
                          <small className="card-text">
                            {track.artists[0].name}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No results where found!</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchFormResultView;
