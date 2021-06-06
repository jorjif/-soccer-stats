import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
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
  //функция фильтрует доступные в данный момент кубки
  const avalible = [
    2000, 2001, 2002, 2003, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2021, 2152,
  ];
  return avalible.includes(id);
}
const currYear = new Date().getFullYear(); //текущий год
function datePicker(startDate, endDate, year) {
  //функция выбора даты чемпионата
  let startMonth = "-01-01"; //изначально месяц-день - начало и конец года
  let endMonth = "-12-31";
  if (startDate !== 0) {
    //но если изменяются пользователем (стандартн. знач. = 0)
    startMonth = "-" + format(startDate, "MM-dd"); //устанавливаются на выбранную
  }
  if (endDate !== 0) {
    endMonth = "-" + format(endDate, "MM-dd");
  }
  return `?dateFrom=${year}${startMonth}&dateTo=${year}${endMonth}`; //возвращает используемый в API фильтр
}

function Main() {
  const [filter, setFilter] = useState(""); //стейт вордфильтра
  const [date, setDate] = useState(currYear); //стейт для текущего года соревнований
  useEffect(() => {
    const params = new URL(document.location).searchParams; // берет url параметры
    //задает переменные с этими параметрами
    const year = params.get("date");
    const name = params.get("name");

    if (name) {
      //проверяет существуют ли url параметры
      setFilter(name);
    }
    if (year) {
      setDate(year);
    }
  }, []);
  //
  function getFilter(string, date) {
    setFilter(string);
    setDate(date);
  }

  //роутер
  // начальная страница - кубки
  //после выбора идут команды этого кубка. Затем сам лист команды
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <SearchBar onChange={getFilter} />
      <Switch>
        <Route
          path="/:id/teams/:teamsId"
          render={(props) => <Team season={date} filter={filter} />}
        />
        <Route
          path="/:id/teams"
          render={(props) => <TeamList filter={filter} season={date} />}
        />
        <Route
          path="/"
          render={(props) => <Championships filter={filter} season={date} />}
        />
      </Switch>
    </MuiPickersUtilsProvider>
  );
}

function Championships(props) {
  const [value, setValue] = useState([]); //контейнер для поиска

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
        const filtered = resp?.competitions;

        return setValue(filtered);
      });
  }, [props]);
  //ворд фильтр полученного из fetch массива
  const participants = value
    ?.filter((elem) => avalibleCups(elem.id))
    .filter((e) => e.name.toLowerCase().includes(props.filter.toLowerCase() || ""))
    .map((comp) => {
      //
      return (
        <Card key={comp.id}>
          <CardActionArea>
            <Link
              to={`${comp.id}/teams?date=${props.season || 2021}&name=${
                props.filter || ""
              }`}
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
    <div className="main">
      <ul className="championships">{participants}</ul>
    </div>
  );
}

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
          const filtered = resp.teams;
          setValue(filtered);
        },
        (error) => {
          throw new Error(error);
        }
      );
  }, [id]); //квадратные скобки чтоб useEffect происходил только при рендере
  const list = teams
    .filter((e) => e.name.toLowerCase().includes(props.filter.toLowerCase() || ""))
    .map((team) => {
      return (
        <Card key={team.id} className="club-list-item">
          <CardActionArea>
            <Link
              to={`/${id}/teams/${team.id}?date=${props.season || 2021}&name=${
                props.filter || ""
              }`}
            >
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
    <div className="main flex">
      <ul className="teams">{list}</ul>
      <ChampionshipSchedule champId={id} season={props.season} />
    </div>
  );
}
function Team(props) {
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
      <TeamSchedule id={teamsId} season={props.season} />
    </div>
  );
}
function SearchBar(props) {
  const [search, setSearch] = useState("");
  const [selectedDate, handleDateChange] = useState(new Date());

  function handleChange(e) {
    setSearch(e.target.value);
  }
  function submitAction(e) {
    e.preventDefault(); //не дает перезагрузиться странице при отправке формы
    props.onChange(search, format(selectedDate, "yyyy")); // изменяет стейт даты в <Main>
    // format приводит дату к необходимому виду
    const currUrl = new URL(window.location.href);
    //ставим url параметры
    currUrl.searchParams.set("date", format(selectedDate, "yyyy"));
    currUrl.searchParams.set("name", search);
    //пушим параметры в конец url
    window.history.pushState({}, "", currUrl);
    //оставляем поисковую строку пустой
    setSearch("");
  }
  return (
    <Card className="search-bar">
      <CardContent>
        <form onSubmit={submitAction} method="GET">
          <TextField
            name="keyword"
            label="Поиск"
            value={search}
            onChange={handleChange}
            className="form-element"
          />

          <DatePicker
            name="date"
            views={["year"]}
            label="Year only"
            onChange={handleDateChange}
            value={selectedDate}
            className="form-element"
          />
          <Button type="submit" variant="contained" color="primary">
            Поиск
          </Button>
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
    url += datePicker(dateFrom, dateTo, props.season); //добавляем строку с фильтром
    console.log(url);
    fetch(url, {
      method: "GET",
      headers: {
        "X-Auth-Token": "61d9e360e25743a0bbf1d837b0d1e7f2",
      },
    })
      .then((response) => response.json())
      .then((resp) => setMatches(resp.matches));
    // eslint-disable-next-line
  }, [dateFrom, dateTo, props.season]);
  const list = matches?.map((elem) => {
    return (
      <li key={elem.id}>
        <div className="match">
          <p>{elem.utcDate.split(/T|Z/).join(" ")}</p>
          <p>{elem.homeTeam.name}</p>
          <p>{elem.awayTeam.name}</p>
        </div>
      </li>
    );
  });
  if (!matches) {
    //в случае возниконвения ошибки рендерим эту страницу
    return (
      <div className="schedule">
        <div className="date-bar">
          <DatePicker
            name="date"
            views={["month", "date"]}
            label="От"
            onChange={setStart}
            format="MM/dd"
            value={dateFrom}
          />
          <DatePicker
            name="date"
            views={["month", "date"]}
            format="MM/dd"
            label="До"
            onChange={setEnd}
            value={dateTo}
          />
        </div>
        <p>Ничего не найдено. Попробуйте ввести другую дату</p>
      </div>
    );
  }
  return (
    <div className="schedule">
      <div className="date-bar">
        <DatePicker
          name="date"
          views={["month", "date"]}
          label="От"
          onChange={setStart}
          format="MM/dd"
          value={dateFrom}
        />
        <DatePicker
          name="date"
          views={["month", "date"]}
          format="MM/dd"
          label="До"
          onChange={setEnd}
          value={dateTo}
        />
      </div>
      <ul className="match-list">{list}</ul>
    </div>
  );
}
function TeamSchedule(props) {
  const [matches, setMatches] = useState([]);
  const [dateFrom, setStart] = useState(0);
  const [dateTo, setEnd] = useState(0);
  useEffect(() => {
    let url = `http://api.football-data.org/v2/teams/${props.id}/matches`;
    url += datePicker(dateFrom, dateTo, props.season);
    fetch(url, {
      method: "GET",
      headers: {
        "X-Auth-Token": "61d9e360e25743a0bbf1d837b0d1e7f2",
      },
    })
      .then((response) => response.json())
      .then((resp) => {
        setMatches(resp.matches);
      });

    // eslint-disable-next-line
  }, [dateFrom, dateTo, props.season]);
  const list = matches?.map((elem) => {
    return (
      <li key={elem.id}>
        <div className="match team-match">
          <p>{elem.utcDate.split(/T|Z/).join(" ")}</p>
          <p>{elem.homeTeam.name}</p>
          <p>{elem.awayTeam.name}</p>
        </div>
      </li>
    );
  });
  if (!matches) {
    return (
      <div className="schedule main">
        <div className="date-bar">
          <DatePicker
            name="date"
            views={["month", "date"]}
            label="От"
            onChange={setStart}
            format="MM/dd"
            value={dateFrom}
          />
          <DatePicker
            name="date"
            views={["month", "date"]}
            format="MM/dd"
            label="До"
            onChange={setEnd}
            value={dateTo}
          />
        </div>
        <p className="error">Ничего не найдено. Попробуйте ввести другую дату</p>
      </div>
    );
  }
  return (
    <div className="schedule margin main">
      <div className="date-bar">
        <DatePicker
          name="date"
          views={["month", "date"]}
          label="От"
          onChange={setStart}
          format="MM/dd"
          value={dateFrom}
        />
        <DatePicker
          name="date"
          views={["month", "date"]}
          format="MM/dd"
          label="До"
          onChange={setEnd}
          value={dateTo}
        />
      </div>
      <ul className="match-list">{list}</ul>
    </div>
  );
}
ReactDOM.render(<App />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
