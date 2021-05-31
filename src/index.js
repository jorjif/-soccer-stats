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
import { Route, Switch, useLocation, useParams } from "react-router";
import { BrowserRouter as Router, Link } from "react-router-dom";

function avalibleCups(id) {
  const avalible = [
    2000, 2001, 2002, 2003, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2021, 2152,
  ];
  return avalible.includes(id);
}

function Main(props) {
  //роутер
  // начальная страница - кубки
  //после выбора идут команды этого кубка. Затем сам лист команды
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Switch>
        <Route path="/:id/teams/:teamsId" component={Team} />
        <Route path="/:id/teams/" component={TeamList} />
        <Route path="/" component={Championships} />
      </Switch>
    </MuiPickersUtilsProvider>
  );
}

function Championships() {
  const [value, setValue] = useState([]); //
  const [filter, setFilter] = useState({
    word: "",
    date: new Date().getFullYear(),
  });

  useEffect(() => {
    let url = "http://api.football-data.org/v2/competitions/";

    fetch(url, {
      method: "GET",
      headers: {
        "X-Auth-Token": "61d9e360e25743a0bbf1d837b0d1e7f2",
      },
    })
      .then((response) => response.json())
      .then((resp) => {
        const filtered = resp.competitions
          .filter((elem) => avalibleCups(elem.id))
          .filter((e) =>
            e.name
              .toLowerCase()
              .includes(filter.word ? filter.word.toLowerCase() : "")
          );
        return setValue([...filtered]); //
      });
  }, [filter.word]);
  function getFilter(string, date) {
    setFilter({
      ...filter,
      word: string,
      date: date,
    });
  }
  const participants = value?.map((comp) => {
    //
    return (
      <Card key={comp.id}>
        <CardActionArea>
          <Link to={`${comp.id}/teams/`}>
            <CardContent>
              <p>{comp.name}</p>
              <p>{comp.area.name}</p>
            </CardContent>
          </Link>
        </CardActionArea>
      </Card>
    );
  });
  return (
    <div>
      <SearchBar onChange={getFilter} />
      <ul>{participants}</ul>
    </div>
  );
}

/*function Cup(props) {
  return <TeamList teams={props.teams} />;
}*/

function TeamList() {
  const [teams, setValue] = useState([]);
  const { id } = useParams(); //берем id из URL, используем для запроса api
  const [filter, setFilter] = useState({
    word: "",
    date: new Date().getFullYear,
  });

  useEffect(() => {
    let url = "http://api.football-data.org/v2/competitions/";

    const cupTemplate = `${id}/teams/`;
    const cupUrl = url + cupTemplate;
    if (filter.date !== new Date().getFullYear) {
      cupUrl += `?season=${filter.date}`;
    }
    fetch(cupUrl, {
      method: "GET",
      headers: {
        "X-Auth-Token": "61d9e360e25743a0bbf1d837b0d1e7f2",
      },
    })
      .then((response) => response.json())
      .then((resp) => {
        setValue([...resp.teams]);
      });
    // eslint-disable-next-line
  }, []); //квадратные скобки чтоб useEffect происходил только при рендере
  function getFilter(string, date) {
    setFilter({
      ...filter,
      word: string,
      date: date,
    });
  }
  const list = teams.map((team) => {
    return (
      <Card key={team.id} className="club-list-item">
        <CardActionArea>
          <Link to={`${team.id}`}>
            <CardContent>
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
      <SearchBar onChange={getFilter} />
      <ul>{list}</ul>
      <ChampionshipSchedule champId={id} />
    </Paper>
  );
}
function Team() {
  const [team, setTeam] = useState({});
  let { teamsId } = useParams();
  useEffect(() => {
    const teamUrl = `http://api.football-data.org/v2/teams/${teamsId}`;
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
  }, []);
  return (
    <Card className="club-card">
      <CardContent>
        <Typography>{team.name}</Typography>
        <Typography>{team.venue}</Typography>
      </CardContent>
    </Card>
  );
}
function SearchBar(props) {
  const [search, setSearch] = useState("");
  const [selectedDate, handleDateChange] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.href);
    const date = params.get("date");
    const name = params.get("name");
    props.onChange(name, date);
    // eslint-disable-next-line
  }, []);

  function handleChange(e) {
    setSearch(e.target.value);
  }
  function submitAction(e) {
    e.preventDefault();
    props.onChange(search, selectedDate);
    const currUrl = new URL(window.location.href);
    currUrl.searchParams.set("date", selectedDate);
    currUrl.searchParams.set("name", search);
    window.history.pushState({}, "", currUrl);
    setSearch("");
  }
  return (
    <Card>
      <CardContent>
        <form onSubmit={submitAction} method="GET">
          <TextField
            name="keyword"
            label="Поиск"
            value={search}
            onChange={handleChange}
          />

          <DatePicker
            name="date"
            views={["year"]}
            label="Year only"
            onChange={handleDateChange}
            value={selectedDate}
          />
          <button type="submit">Поиск</button>
        </form>
      </CardContent>
    </Card>
  );
}
function App(props) {
  return (
    <Router>
      <Main />
    </Router>
  );
}
function ChampionshipSchedule(props) {
  const [matches, setMatches] = {
    value: [],
    dateFrom: 0,
    dateTo: 0,
  };
  useEffect(() => {
    let url = `http://api.football-data.org/v2/matches?competitions={${props.champId}}`;
    if (matches.dateFrom !== 0) {
      url += `&dateFrom=${matches.dateFrom}`;
    }
    if (matches.dateTo !== 0) {
      url += `&dateFrom=${matches.dateTo}`;
    }
    fetch(url, {
      method: "GET",
      headers: {
        "X-Auth-Token": "61d9e360e25743a0bbf1d837b0d1e7f2",
      },
    })
      .then((response) => response.json())
      .then((resp) =>
        setMatches({
          ...matches,
          value: resp.matches,
        })
      );
  });
  const list = matches?.value?.map((elem) => {
    return (
      <li key={elem.id}>
        <Paper>
          <p>{elem.utcDate}</p>
          <p>{elem.homeTeam.name}</p>
          <p>{elem.awayTeam.name}</p>
        </Paper>
      </li>
    );
  });
  return;
  <ul>{list}</ul>;
}
ReactDOM.render(<App />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
