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
import { Route, Switch, useParams } from "react-router";
import { BrowserRouter as Router, Link } from "react-router-dom";
import { format } from "date-fns";

function avalibleCups(id) {
  const avalible = [
    2000, 2001, 2002, 2003, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2021, 2152,
  ];
  return avalible.includes(id);
}

function Main() {
  const [filter, setFilter] = useState("");
  const [date, setDate] = useState(new Date());
  function getFilter(string, date) {
    setFilter(string);
    setDate(date);
  }

  //роутер
  // начальная страница - кубки
  //после выбора идут команды этого кубка. Затем сам лист команды
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <SearchBar onChange={getFilter} season={date} />
      <Switch>
        <Route
          path="/:id/teams/:teamsId"
          render={(props) => <Team season={date} filter={filter} />}
        />
        <Route
          path="/:id/teams"
          render={(props) => <TeamList filter={filter} date={date} />}
        />
        <Route path="/" render={(props) => <Championships filter={filter} />} />
      </Switch>
    </MuiPickersUtilsProvider>
  );
}

function Championships(props) {
  const [value, setValue] = useState([]); //

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
        const filtered = resp?.competitions
          ?.filter((elem) => avalibleCups(elem.id))
          .filter((e) =>
            e.name.toLowerCase().includes(props.filter.toLowerCase() || "")
          );
        return setValue(filtered);
      });
  }, [props.filter]);

  const participants = value?.map((comp) => {
    //
    return (
      <Card key={comp.id}>
        <CardActionArea>
          <Link
            to={`${comp.id}/teams?name=${props.filter || ""}&date=${props.season}`}
          >
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
      <ul>{participants}</ul>
    </div>
  );
}

/*function Cup(props) {
  return <TeamList teams={props.teams} />;
}*/

function TeamList(props) {
  const [teams, setValue] = useState([]);
  const { id } = useParams(); //берем id из URL, используем для запроса api

  useEffect(() => {
    let url = "http://api.football-data.org/v2/competitions/";

    const cupTemplate = `${id}/teams`;
    let cupUrl = url + cupTemplate;
    fetch(cupUrl, {
      method: "GET",
      headers: {
        "X-Auth-Token": "61d9e360e25743a0bbf1d837b0d1e7f2",
      },
    })
      .then((response) => response.json())
      .then(
        (resp) => {
          console.log(resp);
          const filtered = resp?.teams?.filter((e) =>
            e.name.toLowerCase().includes(props.filter.toLowerCase() || "")
          );
          setValue(filtered);
        },
        (error) => {
          throw new Error(error);
        }
      );
    // eslint-disable-next-line
  }, [props.filter]); //квадратные скобки чтоб useEffect происходил только при рендере
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
      <ul>{list}</ul>
      <ChampionshipSchedule champId={id} date={props.date} />
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
    // eslint-disable-next-line
  }, []);
  return (
    <div>
      <Card className="club-card">
        <CardContent>
          <Typography>{team.name}</Typography>
          <Typography>{team.venue}</Typography>
        </CardContent>
      </Card>
      <TeamSchedule id={teamsId} />
    </div>
  );
}
function SearchBar(props) {
  const [search, setSearch] = useState("");
  const [selectedDate, handleDateChange] = useState(new Date());

  useEffect(() => {
    const params = new URLSearchParams(window.location.href);
    const date = params.get("date");
    const name = params.get("name");
    console.log(name);
    console.log(date);
    if (name) {
      setSearch(name);
    }
    if (date) {
      handleDateChange(date);
    }
    props.onChange(search, selectedDate);
    // eslint-disable-next-line
  }, []);

  function handleChange(e) {
    setSearch(e.target.value);
  }
  function submitAction(e) {
    e.preventDefault();
    props.onChange(search, selectedDate);
    const currUrl = new URL(window.location.href);
    currUrl.searchParams.set("date", format(selectedDate, "yyyy"));
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
  const [matches, setMatches] = useState([]);
  const [dateFrom, setStart] = useState(0);
  const [dateTo, setEnd] = useState(0);
  useEffect(() => {
    let url = `http://api.football-data.org/v2/competitions/${props.champId}/matches`;
    console.log(url);
    console.log(dateFrom);
    if (dateFrom !== 0 && dateTo !== 0) {
      url += `?dateFrom=${format(dateFrom, "yyyy-MM-dd")}&dateTo=${format(
        dateTo,
        "yyyy-MM-dd"
      )}`;
    }
    fetch(url, {
      method: "GET",
      headers: {
        "X-Auth-Token": "61d9e360e25743a0bbf1d837b0d1e7f2",
      },
    })
      .then((response) => response.json())
      .then((resp) => setMatches(resp.matches));
    // eslint-disable-next-line
  }, [dateFrom, dateTo]);
  const list = matches?.map((elem) => {
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
  return (
    <div>
      <DatePicker
        name="date"
        views={["year", "month", "date"]}
        label="От"
        onChange={setStart}
        format="yyyy/MM/dd"
        value={dateFrom}
      />
      <DatePicker
        name="date"
        views={["year", "month", "date"]}
        format="yyyy/MM/dd"
        label="До"
        onChange={setEnd}
        value={dateTo}
      />
      <ul>{list}</ul>
    </div>
  );
}
function TeamSchedule(props) {
  const [matches, setMatches] = useState([]);
  const [dateFrom, setStart] = useState(0);
  const [dateTo, setEnd] = useState(0);
  useEffect(() => {
    let url = `http://api.football-data.org/v2/teams/${props.id}/matches`;
    console.log(url);
    console.log(dateFrom);
    if (dateFrom !== 0 && dateTo !== 0) {
      url += `?dateFrom=${format(dateFrom, "yyyy-MM-dd")}&dateTo=${format(
        dateTo,
        "yyyy-MM-dd"
      )}`;
    }

    fetch(url, {
      method: "GET",
      headers: {
        "X-Auth-Token": "61d9e360e25743a0bbf1d837b0d1e7f2",
      },
    })
      .then((response) => response.json())
      .then((resp) => setMatches(resp.matches));
    // eslint-disable-next-line
  }, [dateFrom, dateTo]);
  const list = matches?.map((elem) => {
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
  return (
    <div>
      <DatePicker
        name="date"
        views={["year", "month", "date"]}
        label="От"
        onChange={setStart}
        format="yyyy/MM/dd"
        value={dateFrom}
      />
      <DatePicker
        name="date"
        views={["year", "month", "date"]}
        format="yyyy/MM/dd"
        label="До"
        onChange={setEnd}
        value={dateTo}
      />
      <ul>{list}</ul>
    </div>
  );
}
ReactDOM.render(<App />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
