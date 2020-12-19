import React, { Component } from "react";
import { updateToken } from "../../redux/actions";
import RedirectPageView from "../views/RedirectPageView";
import { connect } from "react-redux";
//TODO: fixa sa att man inte kan komma hit utan inlogg
class RedirectPage extends Component {
  constructor(props) {
    super(props);
    this.URL = window.location.href;
    this.getValues = this.getValues.bind(this);
  }

  getValues(url) {
    const url_arr = url.split("&");
    url_arr[0] = url_arr[0].split("#").pop(); //remove callback#

    const url_obj = url_arr.reduce((prev, curr) => {
      const [title, value] = curr.split("=");
      prev[title] = value;
      return prev;
    }, {});

    return url_obj;
  }

  componentDidMount() {
    this.props.updateToken(this.getValues(this.URL));
  }

  render() {
    return (
      (!this.URL.includes("access_denied") &&
        React.createElement(RedirectPageView, {
          tokenValues: this.props.token,
        })) ||
      React.createElement(RedirectPageView, {
        tokenValues: null,
      })
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.token,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateToken: (URL) => dispatch(updateToken(URL)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RedirectPage);
