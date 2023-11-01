import { useState, useEffect } from "react";
import { OpenAI } from "openai";

//Please enter your OpenAI API key and organization ID here
const AUTHKEY = `${process.env.REACT_APP_AUTHKEY}`;

export default function App() {
  const [currentWeekEntries, setCurrentWeekEntries] = useState([]);

  const [renderHome, setRenderHome] = useState(true);
  const openai = new OpenAI({ apiKey: AUTHKEY, dangerouslyAllowBrowser: true });

  const [renderEntries, setRenderEntries] = useState(true);

  const [renderItems, setRenderItems] = useState(false);

  const [gens, setGens] = useState(JSON.parse(localStorage.getItem("gens")));

  function setLogsOnLoad() {
    try {
      if (
        localStorage.getItem("gens") === null ||
        localStorage.getItem("gens") === undefined ||
        JSON.parse(localStorage.getItem("gens")).length === 0
      ) {
        throw Error("error");
      }
      setGens(JSON.parse(localStorage.getItem("gens")));
    } catch {
      setGens([]);
    }
  }

  function addLog(logValue) {
    let num = null;
    setCurrentWeekEntries((e) => {
      num = e.length === 0 ? 1 : e.slice(-1)[0].number + 1;
      return [...e, { number: num, content: logValue }];
    });
    storeCurrentWeekEntries([
      ...currentWeekEntries,
      { number: num, content: logValue },
    ]);

    if (!renderEntries) setRenderEntries(true);
  }

  function storeCurrentWeekEntries(entries) {
    localStorage.setItem("currentWeekEntries", JSON.stringify(entries));
  }

  function setCurrentWeekEntriesOnLoad() {
    try {
      if (
        localStorage.getItem("currentWeekEntries") === null ||
        localStorage.getItem("currentWeekEntries") === undefined ||
        localStorage.getItem("currentWeekEntries").length === 0
      ) {
        throw Error("error");
      }
      setCurrentWeekEntries(
        JSON.parse(localStorage.getItem("currentWeekEntries"))
      );
      setRenderEntries(true);
    } catch {
      setCurrentWeekEntries([]);
      setRenderEntries(false);
    }
  }

  function resetEntries() {
    localStorage.removeItem("currentWeekEntries");
    setCurrentWeekEntries([]);
    setRenderEntries(false);
  }

  useEffect(() => {
    setCurrentWeekEntriesOnLoad();
    setLogsOnLoad();
  }, []);

  async function callOpenAI(entries) {
    try {
      setRenderHome("loading");
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `A user has below 3 journel entries,

            ${String(
              entries.map((e, i) => `#@$^^Log ${i + 1}: ${e}`)
            ).replaceAll("#@$^^", "\n")}

            Using these three logs, answer to the user under these 3 headings

            What you did best
            Where can you improve
            Tips from my side

            Your answer can only include these three headings and nothing else. Try to be optimistic.
            Return your answer in a JavaScript object`,
          },
        ],
      });

      setRenderHome(JSON.parse(completion.choices[0].message.content));
      setGens((e) => {
        return [
          ...e,
          { entries: entries, genObj: completion.choices[0].message.content },
        ];
      });
      localStorage.setItem(
        "gens",
        JSON.stringify([
          ...gens,
          { entries: entries, genObj: completion.choices[0].message.content },
        ])
      );

      resetEntries();
    } catch (error) {
      setRenderHome("Error");
      setTimeout(() => {
        setRenderHome(true);
      }, 4000);
    }
  }

  if (renderHome === true || renderHome === "Error") {
    return (
      <div className="div-main">
        <BtnHowItWorks setRenderHome={setRenderHome} />
        <ShowPastResultsBtn setRenderHome={setRenderHome} />
        {renderHome === "Error" ? (
          <p className="error">
            There was an error! Please check you internet connection and try
            again.
          </p>
        ) : null}
        <div className="full-div">
          <Logo />
          <CreateLog addLog={addLog} />
        </div>
        <Entries
          currentWeekEntries={currentWeekEntries}
          renderEntries={renderEntries}
          setCurrentWeekEntries={setCurrentWeekEntries}
          setRenderEntries={setRenderEntries}
        />

        <GenerteBtn
          currentWeekEntries={currentWeekEntries}
          callOpenAI={callOpenAI}
          renderEntries={renderEntries}
        />
        {renderEntries ? (
          <RestEntriesBtn
            setCurrentWeekEntries={setCurrentWeekEntries}
            setRenderEntries={setRenderEntries}
          />
        ) : null}
      </div>
    );
  } else if (renderHome === "howItWorks") {
    return (
      <>
        <GoBackBtn setRenderHome={setRenderHome} />
        <div className="div-how-it-works">
          <p className="how-it-works-text-heading">Welcome to JournaLytics!</p>
          <p className="how-it-works-text-subheading">
            What is it? What is its purpose?
          </p>
          <ul>
            <li className="how-it-works-text-content">
              JournaLytics is a journaling platform that leverages artificial
              intelligence to provide users with structured feedback and
              insights on their daily entries, promoting self-reflection,
              personal growth, and enhanced well-being.
            </li>
          </ul>
          <p className="how-it-works-text-subheading">How Do I Get Started?</p>
          <ul>
            <li className="how-it-works-text-content">
              Just start by creating your journal entries and after at least 2
              entries, you can generate feedback.
            </li>
          </ul>
          <p className="how-it-works-text-subheading">
            How Do I Make a Journal Entry?
          </p>
          <ul>
            <li className="how-it-works-text-content">
              On the homepage, you can see a text box where you can enter your
              entry and then hit submit.
            </li>
            <li className="how-it-works-text-content">
              Your entry will be saved and you can even close the app and add
              more entries later. All the data is saved.
            </li>
          </ul>
          <p className="how-it-works-text-subheading">
            How Does AI Feedback Work?
          </p>
          <ul>
            <li className="how-it-works-text-content">
              The AI Feedback is generated under 3 headings -
              <ol>
                <li className="sub-how-it-works-text-content">
                  What You Did Best This Week: Under this section, the AI
                  recognizes your accomplishments and highlights moments of
                  success within your journal entry. It reinforces positive
                  behaviors and achievements.
                </li>
                <li className="sub-how-it-works-text-content">
                  What Can You Improve: In this section, the AI provides
                  constructive insights. It pinpoints areas where you may have
                  faced challenges or where growth opportunities exist. This
                  feedback is geared toward helping you identify and work on
                  areas for self-improvement.
                </li>
                <li className="sub-how-it-works-text-content">
                  Some Tips from My Side: Here, the AI becomes your personalized
                  mentor. Based on the analysis of your entry and the themes it
                  has detected, the AI offers tailored tips and suggestions. It
                  provides guidance on how to build on your strengths and
                  overcome challenges, empowering you to navigate life's journey
                  more effectively.
                </li>
              </ol>
            </li>
            <li className="how-it-works-text-content">
              We recommend that you make at least 3 entries for accurate
              feedback but, our system can also work with a minimum of 2
              entries.
            </li>
            <li className="how-it-works-text-content">
              All of your generated feedbacks can be found in the Past results
              section. You can navigate to that section by clicking on “Show
              past results” on the homepage.
            </li>
          </ul>
          <p className="how-it-works-text-subheading">Is My Data Secure?</p>
          <ul>
            <li className="how-it-works-text-content">
              All your entries and generated text are stored on your own browser
              and are not sent to any servers except when generating text.
            </li>

            <li className="how-it-works-text-content">
              When you are generating text, your entries are sent to OpenAI’s
              servers to get evaluated and receive feedback. You can read about
              OpenAI’s privacy policy{" "}
              <a
                href="https://openai.com/enterprise-privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              .
            </li>
          </ul>
          <p className="how-it-works-text-subheading">
            How Can I Benefit from JournaLytics?
          </p>
          <ul>
            <li className="how-it-works-text-content">
              JournaLytics offers:
              <ol>
                <li className="sub-how-it-works-text-content">
                  Deeper self-awareness and insights.
                </li>
                <li className="sub-how-it-works-text-content">
                  Personalized feedback and guidance.
                </li>
                <li className="sub-how-it-works-text-content">
                  Stress management and enhanced well-being.
                </li>
                <li className="sub-how-it-works-text-content">
                  Efficient self-reflection.
                </li>
                <li className="sub-how-it-works-text-content">
                  Learning about personal development.
                </li>
                <li className="sub-how-it-works-text-content">
                  Privacy and data security.
                </li>
                <li className="sub-how-it-works-text-content">
                  Personal fulfillment and purpose.
                </li>
              </ol>
            </li>
            <li className="how-it-works-text-content">
              JournaLytics empowers you to lead a more fulfilling life through
              self-discovery and self-improvement.
            </li>
          </ul>
        </div>
      </>
    );
  } else {
    if (renderHome !== "pastResults") {
      return (
        <div className="div-main">
          <GoBackBtn setRenderHome={setRenderHome} />
          <Logo />
          <GenerateResult data={renderHome} />
        </div>
      );
    } else {
      return (
        <div className="div-main">
          <GoBackBtn setRenderHome={setRenderHome} />
          <Logo />
          <PastEntries
            renderItems={renderItems}
            setRenderItems={setRenderItems}
            gens={gens}
            setGens={setGens}
          />
          {renderItems ? (
            <ResetGens setRenderItems={setRenderItems} setGens={setGens} />
          ) : null}
        </div>
      );
    }
  }
}

function BtnHowItWorks({ setRenderHome }) {
  function handleClick() {
    setRenderHome("howItWorks");
  }

  return (
    <button className="how-it-works-btn" onClick={handleClick}>
      How it works?
    </button>
  );
}

function ResetGens({ setRenderItems, setGens }) {
  function handleClick() {
    localStorage.removeItem("gens");
    setRenderItems(false);
    setGens([]);
  }

  return (
    <button className="reset-entries" onClick={handleClick}>
      Reset Results
    </button>
  );
}

function RestEntriesBtn({ setCurrentWeekEntries, setRenderEntries }) {
  function handleClick() {
    localStorage.removeItem("currentWeekEntries");
    setCurrentWeekEntries([]);
    setRenderEntries(false);
  }
  return (
    <button className="reset-entries" onClick={handleClick}>
      Reset Entries
    </button>
  );
}

function EntiesModal({ data, num }) {
  const [renderModal, setRenderModal] = useState(false);
  function handleModelClick() {
    document.body.style.overflow = "hidden";
    setRenderModal(true);
  }

  function handleClose() {
    document.body.style.overflow = "auto";
    setRenderModal(false);
  }

  return (
    <div className="each-entry">
      <button onClick={handleModelClick} className="past-entry-btn">
        Entry #{num}
      </button>
      <div className={renderModal ? "modal" : "modal hidden"}>
        <button className="close-modal" onClick={handleClose}>
          &times;
        </button>
        <h1>Entry #{num}</h1>
        <p className="past-entry-data">{data}</p>
      </div>
      <div
        className={renderModal ? "overlay" : "overlay hidden"}
        onClick={handleClose}
      ></div>
    </div>
  );
}

function PastEntriesItem({ data, num, handleRemoveGen }) {
  const [renderModal, setRenderModal] = useState(false);
  function handleModelClick() {
    document.body.style.overflow = "hidden";
    setRenderModal(true);
  }

  function handleClose() {
    document.body.style.overflow = "auto";
    setRenderModal(false);
  }

  const genObj = JSON.parse(data.genObj);
  return (
    <div className="container">
      <div className="past-btn-left">
        <button
          className="btn-remove-past-gen"
          onClick={() => handleRemoveGen(num)}
        >
          &times;
        </button>
      </div>
      <div className="past-btn-right">
        <button className="left-mid-heading-btn" onClick={handleModelClick}>
          Generated Result {num}
        </button>
        <div className={renderModal ? "modal" : "modal hidden"}>
          <button className="close-modal" onClick={handleClose}>
            &times;
          </button>
          <h1>Generated Result {num}</h1>
          <div className="container">
            <h1 className="gen-head-white-bg">What you did best</h1>
            <p className="gen-text">{genObj["What you did best"]}</p>
            <h1 className="gen-head-white-bg">Where can you improve</h1>
            <p className="gen-text">{genObj["Where can you improve"]}</p>
            <h1 className="gen-head-white-bg">Tips from my side</h1>
            <p className="gen-text">{genObj["Tips from my side"]}</p>
          </div>
        </div>
        <div
          className={renderModal ? "overlay" : "overlay hidden"}
          onClick={handleClose}
        ></div>
        <div className="past-entry-item">
          {data.entries.map((e, i) => (
            <EntiesModal data={e} num={i + 1} key={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PastEntries({ renderItems, setRenderItems, gens, setGens }) {
  useEffect(() => {
    if (
      !(
        localStorage.getItem("gens") === null ||
        localStorage.getItem("gens") === undefined ||
        JSON.parse(localStorage.getItem("gens").length) === 0
      )
    ) {
      setRenderItems(true);
    }
  }, []);

  function handleRemoveGen(num) {
    const newGens = JSON.parse(localStorage.getItem("gens")).filter(
      (_, i) => i !== num - 1
    );
    if (newGens.length === 0) {
      localStorage.removeItem("gens");
      setGens(newGens);
      setRenderItems(false);
    } else {
      localStorage.setItem("gens", JSON.stringify(newGens));
      setGens(newGens);
    }
  }

  return (
    <>
      <div className="past-entries">
        <hr></hr>
        <p className="big-heading">Past Results</p>
        <hr></hr>
      </div>
      {renderItems ? (
        <>
          {gens.map((e, i) => (
            <PastEntriesItem
              data={e}
              num={i + 1}
              handleRemoveGen={handleRemoveGen}
              key={i + 1}
            />
          ))}
        </>
      ) : (
        <p className="info">
          {"When you generate feedback from entries, you can see them here :)"}
        </p>
      )}
    </>
  );
}

function ShowPastResultsBtn({ setRenderHome }) {
  function handleClick() {
    setRenderHome("pastResults");
  }
  return (
    <button className="show-past-results-btn" onClick={handleClick}>
      Show past results &#8594;
    </button>
  );
}

function GoBackBtn({ setRenderHome }) {
  function handleClick() {
    setRenderHome(true);
  }

  return (
    <button onClick={handleClick} className="back-home-btn">
      &#8592; Go Back to Home
    </button>
  );
}

function GenerateResult({ data }) {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  try {
    if (
      (data["What you did best"] === undefined ||
        data["Where can you improve"] === undefined ||
        data["Tips from my side"] === undefined) &&
      data !== "loading"
    ) {
      throw Error("Code: 1021");
    }

    return data !== "loading" ? (
      <div className="container">
        <h1 className="gen-head">What you did best</h1>
        <p className="gen-text">{data["What you did best"]}</p>
        <h1 className="gen-head">Where can you improve</h1>
        <p className="gen-text">{data["Where can you improve"]}</p>
        <h1 className="gen-head">Tips from my side</h1>
        <p className="gen-text">{data["Tips from my side"]}</p>
      </div>
    ) : (
      <>
        <div className="container">
          <h1 className="gen-head">What you did best</h1>
          <p className="gen-text">Loading...</p>
          <h1 className="gen-head">Where can you improve</h1>
          <p className="gen-text">Loading...</p>
          <h1 className="gen-head">Tips from my side</h1>
          <p className="gen-text">Loading...</p>
        </div>
      </>
    );
  } catch (error) {
    return (
      <p className="error">
        {`There was an error while generating! Please try again later (${error})`}
      </p>
    );
  }
}

function GenerteBtn({ currentWeekEntries, callOpenAI, renderEntries }) {
  const [btnText, setBtnText] = useState("Generate Feedback");
  const [showQuestion, setShowQuestion] = useState(false);

  function sendDataForGen() {
    const entriesContent = currentWeekEntries.map((e) => e.content);
    callOpenAI(entriesContent);
  }

  function handleYes() {
    sendDataForGen();
    setShowQuestion(false);
  }

  function handleNo() {
    setShowQuestion(false);
  }

  function handleGenerte() {
    if (currentWeekEntries.length < 2) {
      setBtnText("You need atleast 2 entries to generate!");
      setTimeout(() => {
        setBtnText("Generate");
      }, 2000);
    } else if (currentWeekEntries.length < 3) {
      setShowQuestion(true);
    } else {
      sendDataForGen();
    }
  }

  return (
    <>
      {showQuestion ? (
        <div>
          {" "}
          <span className="text-question">
            Are you sure? You have not made 3 entries.
          </span>
          <button className="btnLog2" onClick={handleYes}>
            Yes
          </button>
          <button className="btnLog2" onClick={handleNo}>
            No
          </button>
        </div>
      ) : null}
      {renderEntries ? (
        !showQuestion ? (
          <button className="btnLog" onClick={handleGenerte}>
            {btnText}
          </button>
        ) : null
      ) : null}
    </>
  );
}

function Logo() {
  return (
    <img className="logo" src="logo-main.png" alt="JournaLytics logo"></img>
  );
}

function Entries({
  currentWeekEntries,
  renderEntries,
  setCurrentWeekEntries,
  setRenderEntries,
}) {
  function handleRemoveEntry(id) {
    const newCurrentWeekEntries = currentWeekEntries
      .filter((e) => e.number !== id)
      .map((e, i) => {
        return { number: i + 1, content: e.content };
      });

    if (newCurrentWeekEntries.length === 0) {
      localStorage.removeItem("currentWeekEntries");
      setRenderEntries(false);
    } else {
      localStorage.setItem(
        "currentWeekEntries",
        JSON.stringify(newCurrentWeekEntries)
      );
    }
    setCurrentWeekEntries(newCurrentWeekEntries);
  }

  return (
    <>
      <div className="entry-heading">
        <hr />
        <p className="big-heading">Entries</p>
        <hr />
      </div>
      <div className="entry-elements">
        {renderEntries ? (
          currentWeekEntries.map((e) => (
            <Entry
              data={e}
              key={e.number}
              handleRemoveEntry={handleRemoveEntry}
            />
          ))
        ) : (
          <p className="info">
            {"After you make entries, you can see them here :)"}
          </p>
        )}
      </div>
    </>
  );
}

function Entry({ data, handleRemoveEntry }) {
  return (
    <div className="container">
      <div className="entry-left">
        <div className="container">
          <div className="btn-left">
            <button
              className="btn-remove-entry"
              onClick={() => handleRemoveEntry(data.number)}
            >
              &times;
            </button>
          </div>
          <div className="btn-right">
            <p className="entry-num">{`# ${data.number}`}</p>
          </div>
        </div>
      </div>
      <div className="entry-right">
        <p className="entry-content">{data.content}</p>
      </div>
    </div>
  );
}

function CreateLog({ addLog }) {
  const [logVal, setLogVal] = useState("");
  const [btnText, setBtnText] = useState("Submit");
  function handleLogCreateChange(e) {
    setLogVal(e.target.value);
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (logVal === "") {
      setBtnText("Please write something to add!");
      setTimeout(() => {
        setBtnText("Submit");
      }, 2000);
    } else {
      setBtnText("\u2713 Entry added");
      setTimeout(() => {
        setBtnText("Submit");
      }, 2000);
      addLog(logVal);
      setLogVal("");
    }
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={logVal}
          onChange={(e) => handleLogCreateChange(e)}
          className="create-log"
          placeholder="Tell us about your day!"
        ></textarea>
        <button type="submit" className="btnLog">
          {btnText}
        </button>
      </form>
    </div>
  );
}
