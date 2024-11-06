import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { trans } from "./utils/translate";
import Trans from "./components/Trans";

// @evaluate

const currency = "KES"
const VITE_REFERRAL_MIN_PAYOUT = 14

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>
        {trans("Edit Vite + React")} {_AUTHOR_}
      </h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          {trans("count is")} {count}
        </button>
        <p>
          <Trans>
            Edit{" "}
            <a target={"-blank"} style={{ color: "red" }} href={'https://www.google.com/'}>
              src/App.tsx{" "}
              <span>
                3 <strong>goats </strong>
              </span>
            </a>
            and save to test <strong>HMR</strong>
          </Trans>
        </p>
      </div>
      <p className="read-the-docs">
        {trans("Click on the Vite and React logos to learn more")}
      </p>

      <div style={{
        textAlign:'center',
        maxWidth:'70ch'
      }}>
        <h4> <Trans>what is betkumi affiliate program</Trans></h4>
        <p ><Trans>
          BetKumi Affiliates is a program where we give you the opportunity to earn
          money every month simply by giving us the chance to welcome more
          players through our virtual doors.</Trans>
        </p>
        <h4><Trans>How does the Affiliate Program work</Trans></h4>
        <p >
          <Trans>
          When you share your referral link with any of your friends, family or
          advertise the link and a player signup at our site that player becomes
          your referral and they will earn you commissions by playing at Betkumi.</Trans>
        </p>
        <h4><Trans>How much do i earn?</Trans></h4>
        <p >
          <Trans>
          As part of our affiliate network, you will be paid in a revenue share
          based model. You earn a 30% commission on revenues made.</Trans>
        </p>
        <h4><Trans>When can I withdraw?</Trans></h4>
        <div >
          <ul>
            <li>
              <Trans>
              You can withdraw your earnings once you have accumulated a minimum of {currency} {VITE_REFERRAL_MIN_PAYOUT}.</Trans>
            </li>
            <li>
              <Trans>
              You can withdraw your earnings if {VITE_REFERRAL_MIN_PAYOUT} days have passed since your
              last withdrawal.</Trans>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default App;
