import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

function Main(props) {
  const [screen, setScreen] = useState({
    state: "competition", // три варианта competition, teams, team - отображают свои страницы, цикличны
    content: props, // отображаемый контент страницы
    id: 0,
  });
  if (props.competition)
    setScreen({
      state: "competition",
    });
  if (props.competitors)
    setScreen({
      state: "teams",
    });
  function goingDeeper(value) {
    setScreen({
      state: value,
    });
  }
  function requestInfo(param, value) {
    setScreen({
      [param]: value,
    });
  }
  switch (screen.state) {
    case "competition":
      return (
        <CompetitionList
          content={screen.content}
          request={requestInfo}
          clickEvent={goingDeeper}
        />
      );
    case "teams":
      return <TeamsList content={screen.content} />;
    //case "team":
    // return <TeamPage />;
    default:
      return (
        <CompetitionList
          content={screen.content}
          request={requestInfo}
          clickEvent={goingDeeper}
        />
      );
  }
}

/*function NavBar(props) {
  return (
    <nav>
      <div className="nav-container">{material ui breadcrumbs goes here}</div>
    </nav>
  )
}*/
function SearchBar(props) {
  // боковая панель поиска
  const [submited, setSubm] = useState({
    keyword: "", //отвечает за текстовый фильтр
    date: new Date(), //отвечает за фильтр по дате
  });
  function updateData(value) {
    //функция для передачи в Serach и последующего поднятия стейта
    setSubm({
      keyword: value,
    });
  }
  //function updateDate(value) {}
  return (
    <div className="search-place">
      <form onChange={props.filter(submited)}>
        <Search updateData={updateData} />
        <div>
          <input
            type="date"
            id="season-date"
            onChange={(e) => setSubm({ date: e.target.value })}
          ></input>
          <button onClick={(e) => e.preventDefault()}>Поиск</button>
        </div>
      </form>
    </div>
  );
}
function Search(props) {
  const [input, inpChange] = useState("");
  function handleChange(event) {
    event.preventDefault();
    inpChange((input = event.target.value));
    props.updateData(input);
  }
  return (
    <input type="text" value={input} placeholder="" onChange={handleChange}></input>
  );
}

function CompetitionList(props) {
  const competition = props.content;
  const compList = competition.map((comp) => {
    return (
      <li key={comp.id} onClick={props.clickEvent("teams")}>
        <p>{comp.name}</p>
        <p>{comp.area.name}</p>
        <p>
          сезон: {comp.currentSeason.startDate}-{comp.currentSeason.endDate}
        </p>
      </li>
    );
  });
  return <ol>{compList}</ol>;
}
function TeamsList(props) {
  return (
    <div className="team-card">
      <p className="teamName">{/*team name will go here*/}</p>
      <p className="orig.country">{/*origin country will be here*/}</p>
    </div>
  );
}
/*function Calendar(props) {
  return <ul>{date}</ul>;
}*/
async function fetching(url) {
  const teams = await fetch(url, {
    method: "GET",
    headers: {
      "X-Auth-Token": "ef72570ff371408f9668e414353b7b2e",
    },
  });
  if (!teams.ok) {
    const message = `An error has occured: ${teams.status}`;
    throw new Error(message);
  }

  const teamJson = teams.json();
  return teamJson;
}
function App(props) {
  const [competition, setComp] = useState({
    year: Date.now(),
    league: [],
    id: 0,
  });
  const [competitors, setTeams] = useState({
    year: Date.now(),
    teams: [],
    id: 0,
  });
  const [search, setSearch] = useState({
    date: Date.now(),
    keyword: "",
  });

  const startUrl = "http://api.football-data.org/v2/competitions/";
  const teamUrl = `http://api.football-data.org/v2/teams/${competitors.id}/`;
  const teamsUrl = `http://api.football-data.org/v2/competitions/${competition.id}/teams`;

  fetching(startUrl).then((compet) =>
    setTeams({
      league: compet,
    })
  );

  /*const filtered = compet.competition.filter(
    (elem) => elem.name.include(compet.keyword) && elem.year == year
  );*/
  function changeFilter(value) {
    if (typeof value === "string") {
      setSearch({
        keyword: value,
      });
      return;
    }
    setSearch({
      date: value,
    });
  }
  function setTeam(id) {
    setTeams({
      id: id,
    });
    fetching(teamUrl).then((result) =>
      setTeams({
        teams: result,
      })
    );
  }
  function setLeague(id) {
    setComp({
      id: id,
    });
    fetching(teamsUrl).then((result) =>
      setTeams({
        teams: result,
      })
    );
  }
  return (
    <main>
      <SearchBar filter={changeFilter} />
      <Main
        setTeam={setTeam}
        competition={competition}
        competitors={competitors}
        setLeague={setLeague}
      />
    </main>
  );
}
ReactDOM.render(<App />, document.querySelector("#root"));
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
