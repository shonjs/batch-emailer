import React, { useState, useEffect, MouseEventHandler } from 'react';
import './App.css';

type Job = {
  id: number
  completed: number
  total: number
}

function App() {
  const [emailCount, setEmailCount] = useState<number>(0);
  const [emailJob, setEmailJob] = useState<Job[]>([]);
  const [sseListen, setSseListen] = useState<boolean>(false);

  const isPendingJobsPresent = (jobsList: Job[]) => {
    return jobsList.filter(job => job.completed < job.total).length > 0
  }

  useEffect(() => {
    async function fetchJobs() {
      const result = await fetch('http://localhost:3001/email-job');
      const jobs = await result.json();
      setEmailJob(jobs);
      console.log("pending", isPendingJobsPresent(jobs));
      if (isPendingJobsPresent(jobs)) {
        setSseListen(true);
      }
    }
    fetchJobs();
  }, [])

  useEffect(() => {
    const registerForSSE = () => {
      const sse = new EventSource('http://localhost:3001/email-job-update');
      sse.onmessage = e => {
        console.log("sse", e);
        const jobs: Job[] = JSON.parse(e.data);
        setEmailJob(jobs);
        if (!isPendingJobsPresent(jobs)) {
          sse.close();
          setSseListen(false);
        }
      }
      sse.onerror = e => {
        console.log("sse error", e);
      }
      return sse;
    }
    if (sseListen) {
      const sse = registerForSSE();
      return () => sse.close();
    }
  }, [sseListen])

  const completedPercentage = (completed: number, total: number) => {
    return `${Math.floor((completed * 100) / total)}%`;
  }

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    let count = parseInt(e.currentTarget.value) || 0;
    setEmailCount(count);
  }

  const sendEmail = async (e: React.FormEvent<HTMLInputElement>) => {
    console.log(emailCount)
    const result = await fetch('http://localhost:3001/email-job', {
      method: "POST",
      body: JSON.stringify({
        count: emailCount
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    if (result && result.status >= 500) {
      alert('Unable to send email. Please try again in a short while');
    } else if (result) {
      setSseListen(true);
    }
  }

  return (
    <div className="App">
      <div>
        <input id='emailCount' placeholder='Number of email to send' value={emailCount}
          onChange={handleChange}></input>
        <input type='button' value="Send" onClick={sendEmail}></input>
      </div>
      <div>
        <h2>Scheduled Jobs</h2>
        {emailJob.map((job) => (
          <>
          <li
              key={job.id}
              style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                marginBottom: '10px',
                borderBottom: '1px solid #ccc',
                padding: '5px 0',
              }}
            >
              <div className='job'>
                <strong>ID:</strong> {job.id}
              </div>
              <div className='job'>
                <strong>Total:</strong> {job.total}
              </div>
              <div className='job'>
                <strong>Completed:</strong> {job.completed}
              </div>
              {(job.completed !== job.total) ?
                <div className="progressbar_container">
                  <div
                    className="progressbar"
                    style={{ width: completedPercentage(job.completed, job.total) }}
                  >
                    {completedPercentage(job.completed, job.total)}
                  </div>
                </div> :
                <div className="progressbar_container">
                  <button
                    style={{
                      padding: '3px 6px',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                    }}
                  >
                    Complete
                  </button>
                </div>
              }
            </li>
            </>
        ))}
      </div>
      </div>
  );
}

export default App;
