/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import { typography as Typography, colors } from 'Theme.js';
import PapersContext from 'store/PapersContext.js';
import { getRandomInt } from 'utils';
import Button from 'components/Button';
import Page from 'components/Page';
import ListPlayers from 'components/ListPlayers';
import * as Styles from './TeamsStyles.js';

const Title = () => <h1 css={[Typography.small, Styles.title]}>Create teams</h1>;

export default function GameRoom(props) {
  const Papers = useContext(PapersContext);
  const PaperTeams = Papers.teams;
  const { game } = Papers.state;
  const [tempTeams, setTeams] = useState(PaperTeams);

  function generateTeams() {
    const players = Object.keys(game.players);
    const teamsNr = 2; // TODO option
    const teams = Array.from(Array(teamsNr), () => []);
    const limit = Math.round(players.length / teamsNr);
    const newTempTeams = {};

    function alocateTo(teamIndex, playerId) {
      if (teams[teamIndex].length === limit) {
        const newIndex = teamIndex === teamsNr - 1 ? 0 : teamIndex + 1;
        alocateTo(newIndex, playerId);
      } else {
        teams[teamIndex].push(playerId);
      }
    }

    for (let playerId of players) {
      const teamIndex = getRandomInt(teamsNr - 1);
      alocateTo(teamIndex, playerId);
    }

    teams.forEach((team, index) => {
      newTempTeams[index] = {
        id: index,
        name: `Team ${String.fromCharCode(index + 65)}`, // 65 = A
        players: team,
      };
    });

    setTeams(newTempTeams);
  }

  function handleRenameOf(teamId) {
    var name = prompt('Choose a sweet name.', tempTeams[teamId].name);

    if (name !== null) {
      setTeams(teams => ({
        ...teams,
        [teamId]: {
          ...teams[teamId],
          name,
        },
      }));
    }
  }

  function submitTeamsAndGoNext() {
    Papers.setTeams(tempTeams);
  }

  function renderCTAs() {
    return (
      <Page.Main>
        <Title />
        <button css={Styles.cta} onClick={generateTeams}>
          {/* prettier-ignore */}
          <svg width="72" height="67" viewBox="0 0 72 67" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill={colors.primary} fillRule="evenodd" clipRule="evenodd" d="M39.8323 28.9923C45.7163 32.0128 44.6576 32.296 44.6576 43.7262V44.0548L44.7226 44.06C46.8679 44.247 48.4499 44.4165 49.7872 44.5581C51.0854 44.6965 52.1132 44.8061 52.9119 44.8702L46.2581 29.5079C44.8103 29.5585 42.86 29.3043 39.8323 28.9923ZM17.0651 2.52221L18.7998 12.0159C19.0124 13.1753 20.1248 13.9431 21.2805 13.7292C22.4394 13.5184 23.2071 12.4065 22.9945 11.245L21.2568 1.75234C21.0442 0.590822 19.9298 -0.175946 18.774 0.0348633C17.6162 0.24774 16.8505 1.36172 17.0651 2.52221ZM8.40118 18.6419C9.35673 19.3291 10.6941 19.11 11.3793 18.1469C12.0665 17.189 11.8457 15.8508 10.8912 15.1656L5.58508 11.3721C4.62642 10.6849 3.29112 10.905 2.6018 11.8629C1.91661 12.825 2.13331 14.1591 3.09506 14.8504L8.40118 18.6419ZM46.3644 40.0949C45.869 40.0949 45.4676 40.5031 45.4676 41.0084C45.4676 41.5117 45.869 41.9198 46.3644 41.9198C46.8607 41.9198 47.2621 41.5117 47.2621 41.0084C47.2621 40.5031 46.8607 40.0949 46.3644 40.0949ZM46.6316 34.2191C46.1342 34.2191 45.7328 34.6273 45.7328 35.1305C45.7328 35.6359 46.1342 36.044 46.6316 36.044C47.128 36.044 47.5284 35.6359 47.5284 35.1305C47.5284 34.6273 47.128 34.2191 46.6316 34.2191ZM47.7967 37.4742C47.3003 37.4742 46.8989 37.8824 46.8989 38.3857C46.8989 38.89 47.3003 39.2971 47.7967 39.2971C48.292 39.2971 48.6944 38.89 48.6944 38.3857C48.6944 37.8824 48.292 37.4742 47.7967 37.4742ZM49.2166 41.2585C48.7213 41.2585 48.3178 41.6667 48.3178 42.171C48.3178 42.6742 48.7213 43.0834 49.2166 43.0834C49.7109 43.0834 50.1143 42.6742 50.1143 42.171C50.1143 41.6667 49.7109 41.2585 49.2166 41.2585ZM60.7482 18.8589C60.062 18.7029 59.3428 19.727 59.1385 21.1458C58.9362 22.5667 59.3283 23.844 60.0135 24.001C60.6987 24.156 61.42 23.132 61.6233 21.7121C61.8245 20.2922 61.4334 19.0139 60.7482 18.8589ZM58.1396 33.4058C57.4451 33.3077 56.7196 34.3772 56.5164 35.7981C56.3131 37.218 56.7114 38.4508 57.4059 38.5469C58.1003 38.6471 58.8248 37.5765 59.028 36.1577C59.2303 34.7379 58.833 33.5061 58.1396 33.4058ZM46.1115 15.5407C46.8411 16.1194 46.1301 17.4577 44.5224 18.5324C42.9147 19.6071 41.018 20.0091 40.2874 19.4304C39.5568 18.8538 40.2688 17.5124 41.8776 16.4387C43.4853 15.3651 45.3809 14.962 46.1115 15.5407ZM34.1795 47.1798C33.582 46.8139 32.4913 47.5073 31.7442 48.7319C30.995 49.9544 30.8732 51.244 31.4717 51.6088C32.0703 51.9757 33.16 51.2812 33.9071 50.0577C34.6562 48.8352 34.779 47.5466 34.1795 47.1798ZM38.1214 41.0022C37.5539 40.5868 36.4858 41.242 35.7387 42.4655C34.9916 43.688 34.8451 45.0169 35.4126 45.4302C35.9791 45.8477 37.0472 45.1926 37.7953 43.9701C38.5424 42.7476 38.689 41.4176 38.1214 41.0022ZM29.9693 53.3242C29.3718 52.9584 28.2811 53.6539 27.5319 54.8764C26.7848 56.0989 26.663 57.3885 27.2605 57.7543C27.859 58.1202 28.9497 57.4257 29.6968 56.2022C30.446 54.9807 30.5678 53.6911 29.9693 53.3242ZM6.61699 41.0022C7.18661 40.5868 8.25155 41.242 8.99969 42.4655C9.74679 43.688 9.8923 45.0169 9.32577 45.4302C8.75719 45.8477 7.69122 45.1926 6.94308 43.9701C6.19494 42.7476 6.04944 41.4176 6.61699 41.0022ZM14.7681 45.4385C15.3656 45.0727 16.4573 45.7661 17.2045 46.9886C17.9516 48.2131 18.0754 49.5007 17.4759 49.8676C16.8773 50.2344 15.7887 49.539 15.0405 48.3165C14.2934 47.094 14.1706 45.8043 14.7681 45.4385ZM6.61699 48.89C7.18661 48.4746 8.25155 49.1277 8.99969 50.3533C9.74679 51.5758 9.8923 52.9036 9.32577 53.3191C8.75719 53.7355 7.69122 53.0793 6.94308 51.8568C6.19494 50.6333 6.04944 49.3034 6.61699 48.89ZM14.7681 53.3242C15.3656 52.9584 16.4573 53.6539 17.2045 54.8764C17.9516 56.0989 18.0754 57.3885 17.4759 57.7543C16.8773 58.1202 15.7887 57.4257 15.0405 56.2022C14.2934 54.9807 14.1706 53.6911 14.7681 53.3242ZM24.9934 28.4156C25.0512 29.1173 23.9346 29.6857 22.5023 29.6857C21.0711 29.6857 19.8637 29.1173 19.807 28.4156C19.7502 27.714 20.8647 27.1446 22.297 27.1446C23.7293 27.1446 24.9366 27.714 24.9934 28.4156ZM16.9589 33.0596C16.9589 33.7623 15.798 34.3307 14.3657 34.3307C12.9344 34.3307 11.7735 33.7623 11.7735 33.0596C11.7735 32.36 12.9344 31.7907 14.3657 31.7907C15.798 31.7907 16.9589 32.36 16.9589 33.0596ZM33.6996 33.2498C33.6996 33.9515 32.5408 34.5198 31.1085 34.5198C29.6752 34.5198 28.5143 33.9515 28.5143 33.2498C28.5143 32.5481 29.6752 31.9798 31.1085 31.9798C32.5408 31.9798 33.6996 32.5481 33.6996 33.2498ZM25.142 33.1289C25.2266 33.8285 24.1338 34.4392 22.7025 34.494C21.2712 34.5477 20.0412 34.0269 19.9586 33.3273C19.8751 32.6267 20.9668 32.017 22.3991 31.9622C23.8294 31.9074 25.0584 32.4303 25.142 33.1289ZM25.1316 37.5621C25.1884 38.2627 24.0729 38.8321 22.6396 38.8321C21.2073 38.8321 20.002 38.2627 19.9452 37.5621C19.8874 36.8594 21.0019 36.29 22.4342 36.29C23.8665 36.29 25.0728 36.8594 25.1316 37.5621ZM44.703 48.2431C44.8547 57.5249 44.8031 55.638 33.5108 61.7143C20.4096 68.7619 24.3216 68.7619 11.2193 61.7143C-1.62699 54.802 0.07464 58.1987 0.07464 43.7262C0.07464 29.2547 -1.62699 32.6515 11.2193 25.7381C20.2393 20.8875 21.1959 19.3746 25.1905 21.2037C26.3483 19.7693 27.9859 17.9061 30.154 15.1698C39.4041 3.50805 35.8099 5.05916 50.6272 6.34159C65.1587 7.60128 62.2528 5.15733 67.9686 18.4497C73.6823 31.741 73.9052 27.9485 64.8357 39.3839C55.6568 50.9557 59.1189 49.5214 44.703 48.2431ZM28.926 23.1971C29.539 23.5432 30.2107 23.9235 30.9496 24.3348L40.9344 25.1233L46.7173 25.5449C46.7358 25.5377 46.7565 25.5263 46.7761 25.5191L58.7732 11.0693C58.0529 11.0083 57.0757 10.9505 55.8177 10.875C54.1584 10.7769 52.1606 10.658 50.2671 10.4958C48.1207 10.3077 46.5398 10.1393 45.2014 9.99665C42.0737 9.6639 40.5103 9.4965 39.9531 9.73727C39.3958 9.97702 38.4434 11.2295 36.5354 13.7334C35.7181 14.806 34.7543 16.0729 33.4138 17.7615C32.2323 19.2516 30.9455 20.7872 29.8764 22.0603C29.5255 22.4789 29.2067 22.8591 28.926 23.1971ZM50.0535 27.8194L56.6835 43.1206C57.1592 42.5223 57.7392 41.7607 58.4533 40.8224C59.2716 39.7487 60.2354 38.4828 61.5748 36.7943C62.7564 35.3031 64.0421 33.7696 65.1122 32.4954C66.8861 30.3791 67.7931 29.2971 67.8478 28.9313C67.9097 28.5221 67.2782 27.1187 65.9842 24.2428C65.2784 22.6711 64.458 20.8482 64.1381 20.1021C63.8161 19.3539 63.0577 17.5042 62.4024 15.9107C62.0299 15.0044 61.7172 14.2418 61.452 13.6135C60.4686 15.0364 58.6824 16.9389 55.924 20.4173C52.9387 24.1798 51.3815 26.476 50.0535 27.8194ZM22.3372 41.8279C22.3578 41.8279 22.3785 41.8268 22.3991 41.8258L39.1255 33.3066C38.4877 32.9666 37.6137 32.5254 36.4858 31.9591C35.0019 31.2099 33.2126 30.3109 31.5398 29.4108C29.6411 28.3888 28.2573 27.6075 27.084 26.9472C24.3422 25.4013 22.9729 24.6293 22.3661 24.6293C21.7583 24.6293 20.3879 25.4013 17.6492 26.9472C16.4749 27.6075 15.089 28.3888 13.1913 29.4108C11.5176 30.3109 9.73028 31.2099 8.24329 31.9591C7.26297 32.452 6.47252 32.8499 5.86576 33.1681L17.191 39.1494L22.3372 41.8279ZM24.5022 45.237L24.5486 61.9168C25.2235 61.5561 26.0573 61.0849 27.084 60.5073C28.2573 59.8469 29.6411 59.0647 31.5398 58.0437C33.2126 57.1426 35.0019 56.2415 36.4858 55.4954C38.948 54.2563 40.21 53.6198 40.4061 53.3046C40.6238 52.9533 40.6001 51.4156 40.5464 48.2617C40.5186 46.5391 40.4855 44.5384 40.4855 43.7262C40.4855 42.914 40.5186 40.9133 40.5464 39.1917C40.5619 38.211 40.5784 37.3864 40.5815 36.7044C39.1151 37.622 36.7242 38.6626 32.8184 40.7635C28.5906 43.038 26.2523 44.5291 24.5022 45.237ZM20.3951 62.0294L20.3477 45.2856C18.5862 44.5963 16.2386 43.0907 11.9138 40.7635C7.9265 38.6192 5.55721 37.6024 4.14968 36.7013C4.15484 37.3823 4.16825 38.21 4.18373 39.1917C4.21263 40.9133 4.24565 42.914 4.24565 43.7262C4.24565 44.5384 4.21263 46.5391 4.18373 48.2617C4.13214 51.4156 4.10737 52.9533 4.3251 53.3046C4.5191 53.6198 5.78217 54.2563 8.24329 55.4954C9.73028 56.2415 11.5176 57.1426 13.1913 58.0437C15.089 59.0647 16.4749 59.8469 17.6492 60.5073C18.7843 61.148 19.6862 61.6554 20.3951 62.0294Z"/>
          </svg>
          Click to create a random team!
        </button>
      </Page.Main>
    );
  }

  function renderTeams() {
    return (
      <Fragment>
        <Page.Main>
          <Title />
          {Object.keys(tempTeams).map(teamId => {
            const { id, name, players } = tempTeams[teamId];

            return (
              <div key={id} css={Styles.team}>
                <header css={Styles.headerTeam}>
                  <h1 css={Typography.h1}>{name}</h1>
                  <Button onClick={() => handleRenameOf(id)} variant="flat">
                    Rename
                  </Button>
                </header>
                <ListPlayers players={players} />
              </div>
            );
          })}
        </Page.Main>
        <Page.CTAs>
          <Button variant="light" onClick={generateTeams}>
            Create a different random team
          </Button>
          <Button onClick={submitTeamsAndGoNext}>Next: Write your 10 words!</Button>
        </Page.CTAs>
      </Fragment>
    );
  }

  return (
    <Page>
      <Page.Header>
        <Button css={Styles.backBtn} variant="flat" as={Link} to={`/game/${game.name}`}>
          Back to lobby
        </Button>
      </Page.Header>
      {!tempTeams ? renderCTAs() : renderTeams()}
    </Page>
  );
}
