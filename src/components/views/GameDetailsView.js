import { useHistory, Redirect } from "react-router-dom";

const GameDetailsView = ({
  current_playlist,
  startPlaying,
  myPlaylist,
  removePlaylist,
  token,
}) => {
  let history = useHistory();

  return (
    <div>
      {token === undefined ? (
        <Redirect to="/login" />
      ) : (
        <div className="container">
          <button
            className="btn btn-secondary exitButton my-2"
            onClick={() => history.push("/dashboard")}
          >
            Exit
          </button>
          <div className="container text-center">
           <h1 className="display-5 lead text-muted">		             <h1 className="display-4 lead">
             Highscore: {current_playlist.highscore}		               Playlist - {current_playlist.name}
           </h1>		             </h1>
             <h1 className="display-5 lead text-muted">
               Highscore: {current_playlist.highscore}
             </h1>
             <div className="row-sm-4 mb-3">
               <button
                 className="btn btn-secondary primaryButton mr-2"
                 onClick={() => {
                   history.push("/play");
                   startPlaying();
                 }}
               >
                 Let's Play!
               </button>
               {myPlaylist ? (
                 <button
                   className="btn btn-danger"
                   onClick={() => {
                     removePlaylist(current_playlist);
                     setTimeout(() => {
                       history.push("/dashboard");
                     }, 250);
                   }}
                 >
                   Remove Playlist
                 </button>
               ) : (
                 ""
               )}
             </div>
           </div>
          <section className="jumbotron text-center">
            <div className="container">
              <div className="row justify-content-center">
                {current_playlist.tracks.map((track) => (
                  <div className="col-md-3" key={track.id}>
                    <div className="card-mb-4">
                      <img
                        className="card-img-top"
                        src={track.imgURL[0].url}
                        alt="descr"
                      ></img>
                      <div className="card-body">
                        <p className="card-text">
                          <strong>{track.title}</strong>
                          <br />
                          {track.artist}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <div className="container text-center">
            <div className="col">
              <h4 className="display-5 text-muted">
                Total Tracks: {current_playlist.tracks.length}
              </h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDetailsView;
