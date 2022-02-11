import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import DateRangePicker from "../../components/DateRangePicker";
import { useStoreActions } from "easy-peasy";
import Cookies from "cookies";
import { House as HouseModel } from "../../model.js";
import { useStoreState } from "easy-peasy";
import axios from "axios";

const calcNumberOfNightsBetweenDates = (startDate, endDate) => {
  const start = new Date(startDate); //clone
  const end = new Date(endDate); //clone
  let dayCount = 0;

  while (end > start) {
    dayCount++;
    start.setDate(start.getDate() + 1);
  }

  return dayCount;
};

export default function House({ house, nextbnb_session }) {
  const [dateChosen, setDateChosen] = useState(false);
  const [numberOfNightsBetweenDates, setNumberOfNightsBetweenDates] =
    useState(0);
  const setShowLoginModal = useStoreActions(
    (actions) => actions.modals.setShowLoginModal
  );
  const setLoggedIn = useStoreActions((actions) => actions.login.setLoggedIn);
  useEffect(() => {
    if (nextbnb_session) {
      setLoggedIn(true);
    }
  }, []);

  const loggedIn = useStoreState((state) => state.login.loggedIn);

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  return (
    <Layout
      content={
        <div className="container">
          <Head>
            <title>{house.title}</title>
          </Head>
          <article>
            <img
              src={`/img/${house.picture}`}
              width="100%"
              alt="House picture"
            />
            <p>
              {house.type} - {house.town}
            </p>
            <p>{house.title}</p>
          </article>
          <aside>
            <h2>Choose a date</h2>
            <DateRangePicker
              datesChanged={(startDate, endDate) => {
                setNumberOfNightsBetweenDates(
                  calcNumberOfNightsBetweenDates(startDate, endDate)
                );
                setDateChosen(true);
                setStartDate(startDate);
                setEndDate(endDate);
              }}
            />
            {dateChosen && (
              <div>
                <h2>Price per night</h2>
                <p>${house.price}</p>
                <h2>Total price for booking</h2>
                <p>${(numberOfNightsBetweenDates * house.price).toFixed(2)}</p>
                {loggedIn ? (
                  <button
                    className="reserve"
                    onClick={async () => {
                      try {
                        const response = await axios.post("/api/reserve", {
                          houseId: house.id,
                          startDate,
                          endDate,
                        });
                        if (response.data.status === "error") {
                          alert(response.data.message);
                          return;
                        }
                        console.log(response.data);
                      } catch (error) {
                        console.log(error);
                        return;
                      }
                    }}
                  >
                    Reserve
                  </button>
                ) : (
                  <button
                    className="reserve"
                    onClick={() => {
                      setShowLoginModal();
                    }}
                  >
                    Log in to Reserve
                  </button>
                )}
              </div>
            )}
          </aside>

          <style jsx>{`
            .container {
              display: grid;
              grid-template-columns: 60% 40%;
              grid-gap: 30px;
            }
            aside {
              border: 1px solid #ccc;
              padding: 20px;
            }
          `}</style>
        </div>
      }
    />
  );
}

export async function getServerSideProps({ req, res, query }) {
  const { id } = query;
  const cookies = new Cookies(req, res);
  const nextbnb_session = cookies.get("nextbnb_session");

  const house = await HouseModel.findByPk(id);

  return {
    props: {
      house: house.dataValues,
      nextbnb_session: nextbnb_session || null,
    },
  };
}
