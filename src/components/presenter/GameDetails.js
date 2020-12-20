import React, { Component } from "react";
import GameDetailsView from "../views/GameDetailsView";
import Play from "./Play";
import { connect } from "react-redux";
import promiseNoData from "../views/promiseNoData";
import { isPlaying } from "../../redux/actions";
import { db } from "../../firebase";

class GameDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      err: null,
    };
    this.startPlaying = this.startPlaying.bind(this);
    this.removePlaylist = this.removePlaylist.bind(this);
  }

  startPlaying = () => {
    this.props.isPlaying(true);
  };

  removePlaylist(current_playlist) {
    try {
      this.setState({ loading: true });
      db.collection("playlists")
        .doc("playlistsdoc")
        .get()
        .then((doc) => {
          return doc.data().playlist;
        })
        .then((playlists) => {
          let collectArr = [];
          playlists.forEach((playlist) => {
            if (playlist.id !== current_playlist.id) {
              collectArr.push(playlist);
            }
          });
          db.collection("playlists")
            .doc("playlistsdoc")
            .set({ playlist: collectArr });
        });
    } catch (err) {
      this.setState({ err: err });
    }
  }

  componentDidMount() {
    if (this.props.token !== undefined) {
      this.setState({ loading: true });
      setTimeout(() => {
        this.setState({ loading: false });
      }, 500);
    }
  }

  render() {
    let myPlaylist = this.props.current_playlist.id.includes(
      this.props.current_user.id
    );
    return React.createElement(
      React.Fragment,
      {},
      !this.props.is_playing
        ? promiseNoData(this.state.loading, this.state.err) ||
            React.createElement(GameDetailsView, {
              current_playlist: this.props.current_playlist,
              startPlaying: () => this.startPlaying(),
              myPlaylist: myPlaylist,
              removePlaylist: (current_playlist) =>
                this.removePlaylist(current_playlist),
              token: this.props.token,
            })
        : promiseNoData(this.state.loading, this.state.err) ||
            React.createElement(Play, {})
    );
  }
}

const mapStateToProps = (state) => {
  return {
    current_playlist: state.current_playlist,
    current_user: state.current_user,
    is_playing: state.is_playing,
    token: state.token,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    isPlaying: (is_playing) => dispatch(isPlaying(is_playing)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameDetails);
