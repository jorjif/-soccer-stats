import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import {
  Card,
  CardActionArea,
  CardContent,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import "@fontsource/roboto";
//import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { DatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { Route } from "react-router";
import { BrowserRouter, Link } from "react-router-dom";

function avalibleCups(id) {
  const avalible = [
    2000, 2001, 2002, 2003, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2021, 2152,
  ];
  return avalible.includes(id);
}
function Main(props) {
  const [state, setState] = useState({
    main: "competitions",
    id: 0,
  });
  const [value, setValue] = useState([]);
  const [team, setTeam] = useState({
    team: {},
    id: 0,
  });
  const [filter, setFilter] = useState({
    word: "",
    date: new Date().getFullYear,
  });
  useEffect(() => {
    const url = "http://api.football-data.org/v2/competitions/";
    if (state.main === "competitions" || undefined) {
      //fetch for one state
      fetch(url, {
        method: "GET",
        headers: {
          "X-Auth-Token": "61d9e360e25743a0bbf1d837b0d1e7f2",
        },
      })
        .then((response) => response.json())
        .then((resp) => {
          const filtered = resp.competitions.filter((elem) => avalibleCups(elem.id));
          return setValue([...filtered]);
        });
    }
    if (state.main === "teams") {
      //fetch for another
      const cupTemplate = `${state.id}/teams/`;
      const cupUrl = url + cupTemplate;
      fetch(cupUrl, {
        method: "GET",
        headers: {
          "X-Auth-Token": "61d9e360e25743a0bbf1d837b0d1e7f2",
        },
      })
        .then((response) => response.json())
        .then((resp) => {
          setValue([...resp.teams]);
          console.log(resp);
        });
    }
    if (state.main === "team") {
      const teamUrl = `http://api.football-data.org/v2/teams/${state.id}`;
      fetch(teamUrl, {
        method: "GET",
        headers: {
          "X-Auth-Token": "61d9e360e25743a0bbf1d837b0d1e7f2",
        },
      })
        .then((response) => response.json())
        .then((resp) => {
          setTeam({ ...resp });
          console.log(resp);
        });
    }
  }, [state.main]);
  function getFilter(string, date) {
    setFilter({
      ...filter,
      word: string,
      date: date,
    });
  }
  function toLowerLayer(num, stat) {
    //function that changes a status and id to a key of an element when you click on it
    setState({
      ...state,
      id: num,
      main: stat,
    });
  }
  switch (state.main) {
    case "competitions":
      return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Route path="/" exact>
            <SearchBar onChange={getFilter} />
            <Championships competitors={value} onChange={toLowerLayer} />
          </Route>
        </MuiPickersUtilsProvider>
      );
    case "teams":
      return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Route path="/teams/:id">
            <SearchBar onChange={getFilter} />
            <TeamList teams={value} onChange={toLowerLayer} />
          </Route>
        </MuiPickersUtilsProvider>
      );
    case "team":
      return (
        <Route path="/team/:id">
          <Team team={team} />
        </Route>
      );
    default:
      return (
        <Route path="/">
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Championships competitors={value} onChange={toLowerLayer} />
          </MuiPickersUtilsProvider>
        </Route>
      );
  }
}
/*function Info(props) {
  if (!props.value) return null;
  const content = props.value;
  console.log(content);
  return <Championships competitors={content} onChange={props.onChange} />;
}
*/
function Championships(props) {
  const participants = props?.competitors?.map((comp) => {
    return (
      <Card key={comp.id} onClick={() => props.onChange(comp.id, "teams")}>
        <CardActionArea>
          <Link to={`/teams/:id=${comp.id}`}>
            <CardContent>
              <p>{comp.name}</p>
              <p>{comp.area.name}</p>
            </CardContent>
          </Link>
        </CardActionArea>
      </Card>
    );
  });
  return <ul>{participants}</ul>;
}

/*function Cup(props) {
  return <TeamList teams={props.teams} />;
}*/

function TeamList(props, { match }) {
  console.log(match);
  const list = props?.teams?.map((team) => {
    return (
      <Card key={team.id} className="club-list-item">
        <CardActionArea>
          <Link to={`/team/${team.id}`}>
            <CardContent onClick={() => props.onChange(team.id, "team")}>
              <p>{team.name}</p>
              <p>{team.area.name}</p>
              <p>{team.tla}</p>
            </CardContent>
          </Link>
        </CardActionArea>
      </Card>
    );
  });
  return (
    <Paper className="main">
      <ul>{list}</ul>
    </Paper>
  );
}
function Team(props) {
  return (
    <Card className="club-card">
      <CardContent>
        <Typography>{props.team.name}</Typography>
        <Typography>{props.team.venue}</Typography>
      </CardContent>
    </Card>
  );
}
function SearchBar(props) {
  const [search, setSearch] = useState("");
  const [selectedDate, handleDateChange] = useState(new Date().getFullYear());
  let data = new URLSearchParams();
  function handleChange(e) {
    setSearch(e.target.value);
  }
  return (
    <Card>
      <CardContent>
        <Paper>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              props.onChange(search, selectedDate);
            }}
            method="GET"
          >
            <TextField name="season" label="Поиск" value={setSearch} />

            <DatePicker
              views={["year"]}
              label="Year only"
              onChange={handleDateChange}
              value={search}
            />
            <input type="submit"></input>
          </form>
        </Paper>
      </CardContent>
    </Card>
  );
}
function App(props) {
  return (
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  );
}
ReactDOM.render(<App />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
