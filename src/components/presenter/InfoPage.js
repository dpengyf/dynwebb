import React, { Component } from "react";
import { connect } from "react-redux";
import ApiHandler from "../../apiHandler";
import { updateCurrentUser } from "../../redux/actions";
import InfoPageView from "../views/InfoPageView";
import promiseNoData from "../views/promiseNoData";
import { db } from "../../firebase";
class InfoPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      name: "",
      score: 0,
      loading: props.token === undefined ? false : true,
      err: null,
      exist: false,
    };
    this.isExistingUser = this.isExistingUser.bind(this);
  }

  isExistingUser() {
    try {
      db.collection("users")
        .doc("userdoc")
        .get()
        .then((doc) => {
          return doc.data().users;
        })
        .then((users) => {
          users.forEach((elem) => {
            if (elem.userid === this.state.id) {
              this.setState({ score: elem.score, exist: true });
            }
          });
        });
    } catch (err) {
      this.setState({ err: err });
    }
  }

  componentDidMount() {
    if (this.props.token !== undefined) {
      ApiHandler.fetchUserData(this.props.token.access_token)
        .then((res) => {
          this.setState({
            id: res.id,
            name: res.display_name,
            loading: false,
          });
          this.isExistingUser();
        })
        .catch((err) => this.setState({ err: err }));
    }
  }

  render() {
    return (
      promiseNoData(this.state.loading, this.state.id, this.state.err) ||
      React.createElement(InfoPageView, {
        fireOnClick: () =>
          this.props.updateCurrentUser({
            id: this.state.id,
            name: this.state.name,
            score: this.state.score,
            exist: this.state.exist,
          }),
        token: this.props.token,
      })
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.token,
    current_user: state.current_user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateCurrentUser: (userDetails) =>
      dispatch(updateCurrentUser(userDetails)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InfoPage);
