import React from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import * as roomActions from "../actions/roomActions"
import Main from "./Main/Main"
import '../App.css'

@connect((store) => {
  return {
    roomData: store.data,
    roomFetched: store.fetched,
  };
})
class LayoutContainer extends React.Component {
  componentWillMount() {
    this.props.roomActions.fetchRoom()
  }

  render() {
    const mainProps = {
        label: "Ocupada hasta",
        time: 30,
        state: "busy"
    }

    return <div>
      <Main {...mainProps}/>
    </div>
  }
}

function mapStateToProps(state){
  return{
    room:state.room,
    fetching:state.fetching
  }
}

function mapDispatchToProps(dispatch){
  return{
    roomActions:bindActionCreators(roomActions,dispatch)
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(LayoutContainer)
