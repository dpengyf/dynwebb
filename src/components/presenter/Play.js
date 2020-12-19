import React, { Component } from "react";
import { connect } from "react-redux";
import ApiHandler from "../../apiHandler";
import { GameOverScoreBoard, PlayView } from "../views/PlayView";
import promiseNoData from "../views/promiseNoData";
import { DragDropContext } from "react-beautiful-dnd";
import { isPlaying, updateCurrentUser } from "../../redux/actions";
import { updateCurrentPlaylist } from "../../redux/actions";
import { db } from "../../firebase";

class Play extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalLyrics: [],
      lyrics: null,
      playingMusic: true,
      loading: props.token === undefined ? false : true,
      error: null,
      end: false,
    };
    this.songCounter = 0;
    this.totalScore = 0;
    this.timeScoreVal = 0;
    this.calcTimeScore = this.calcTimeScore.bind(this);
    this.reorder = this.reorder.bind(this);
    this.shuffle = this.shuffle.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.audioControl = this.audioControl.bind(this);
    this.stopPlaying = this.stopPlaying.bind(this);
    this.setStartVolume = this.setStartVolume.bind(this);
    this.update = this.update.bind(this);
    this.scoreSum = this.scoreSum.bind(this);
    this.endGame = this.endGame.bind(this);
    this.nextSong = this.nextSong.bind(this);
    this.isBestScore = this.isBestScore.bind(this);
  }
  isBestScore() {
    if (this.totalScore > this.props.userDetails.score) {
      db.collection("users")
        .doc("userdoc")
        .get()
        .then((doc) => {
          return doc.data().users;
        })
        .then((users) => {
          let collectArr = [];
          users.forEach((user) => {
            if (user.userid === this.props.userDetails.id) {
              collectArr.push({
                userid: user.userid,
                score: this.totalScore,
              });
            } else {
              collectArr.push(user);
            }
          });
          db.collection("users").doc("userdoc").set({
            users: collectArr,
          });
        });

      this.props.updateCurrentUser({
        id: this.props.userDetails.id,
        name: this.props.userDetails.name,
        score: this.totalScore,
        exist: true,
      });
    }
  }

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  shuffle = (array) => {
    var tmp,
      current,
      top = array.length;

    if (top)
      while (--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
      }
    return array;
  };

  onDragEnd(result) {
    if (!result.destination) {
      return;
    }
    const lyrics = this.reorder(
      this.state.lyrics,
      result.source.index,
      result.destination.index
    );

    this.setState({
      lyrics,
      loading: false,
    });
  }

  stopPlaying = () => {
    this.props.isPlaying(false);
  };

  audioControl() {
    let player = document.getElementById("audioPlay");
    if (player.paused) {
      player.play();
      this.setState({ playingMusic: true });
    } else {
      player.pause();
      this.setState({ playingMusic: false });
    }
  }

  scoreSum() {
    let totSort = 0;
    let counter = 0;
    if (this.timeScoreVal !== 0) {
      this.totalScore += this.timeScoreVal;
    }
    this.state.originalLyrics.forEach((elem) => {
      if (elem === this.state.lyrics[counter]) {
        totSort++;
      }
      counter++;
    });
    this.totalScore += totSort * 50;
  }

  componentDidMount() {
    if (this.props.token !== undefined) {
      this.update();
    }
  }

  componentDidUpdate() {
    if (this.state.loading && !this.state.end) {
      this.update();
    }
  }

  calcTimeScore(remainingTime) {
    this.timeScoreVal = 2 * remainingTime;
  }

  update() {
    ApiHandler.fetchLyrics(
      this.props.playlist.tracks[this.songCounter].title,
      this.props.playlist.tracks[this.songCounter].artist
    )
      .then((res) => {
        const originalLyrics = res
          .substring(res.indexOf("..."), "")
          .split(/\n/)
          .filter((sentence) => sentence !== "");
        let splitLyrics = null;

        if (originalLyrics.length > 7) {
          splitLyrics = originalLyrics.slice(0, 6);
        } else {
          splitLyrics = originalLyrics;
        }
        const shuffledLyrics = this.shuffle(splitLyrics);

        this.setState({
          originalLyrics: originalLyrics,
          lyrics: shuffledLyrics,
          loading: false,
        });
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  }

  nextSong() {
    this.songCounter += 1;
    this.setState({ loading: true });
    this.scoreSum();
  }

  endGame() {
    this.scoreSum();
    this.setState({ loading: true, end: true });
    setTimeout(() => {
      this.isBestScore();
      this.pushToFirebase();
      this.setState({ loading: false });
    }, 500);
    this.stopPlaying();
  }

  setStartVolume() {
    let audio = document.getElementById("audioPlay");
    if (audio) {
      audio.volume = 0.1;
    }
  }

  pushToFirebase() {
    if (this.totalScore > this.props.playlist.highscore) {
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
            playlists.forEach((elem) => {
              if (
                elem.id.concat(elem.name) ===
                this.props.playlist.id.concat(this.props.playlist.name)
              ) {
                collectArr.push({
                  id: this.props.playlist.id,
                  highscore: this.totalScore,
                  name: this.props.playlist.name,
                  tracks: this.props.playlist.tracks,
                });
              } else {
                collectArr.push(elem);
              }
            });

            db.collection("playlists").doc("playlistsdoc").set({
              playlist: collectArr,
            });

            this.setState({ loading: false });
          })
          .catch((err) => this.setState({ error: err }));
      } catch (err) {
        this.setState({ error: err });
      }
    }
  }

  render() {
    return !this.state.end
      ? promiseNoData(this.state.loading, this.state.error) ||
          React.createElement(
            DragDropContext,
            { onDragEnd: this.onDragEnd },
            React.createElement(PlayView, {
              nextSong: () => this.nextSong(),
              lyricTokens: this.state.lyrics ? this.state.lyrics : null,
              playlist: this.props.playlist,
              audioControl: () => this.audioControl(),
              stopPlaying: () => this.stopPlaying(),
              playingMusic: this.state.playingMusic,
              setStartVolume: () => this.setStartVolume(),
              songCounter: this.songCounter,
              originalLyrics: this.state.originalLyrics,
              endGame: () => this.endGame(),
              token: this.props.token,
              calcTimeScore: (remainingTime) =>
                this.calcTimeScore(remainingTime),
            })
          )
      : promiseNoData(this.state.loading, this.state.error) ||
          React.createElement(GameOverScoreBoard, {
            totalScore: this.totalScore,
            playlist: this.props.playlist,
            token: this.props.token,
          });
  }
}

const mapStateToProps = (state) => {
  return {
    playlist: state.current_playlist,
    userDetails: state.current_user,
    token: state.token,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    isPlaying: (is_playing) => dispatch(isPlaying(is_playing)),
    updateCurrentPlaylist: (playlist) =>
      dispatch(updateCurrentPlaylist(playlist)),
    updateCurrentUser: (userDetails) =>
      dispatch(updateCurrentUser(userDetails)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Play);
