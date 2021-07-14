//create db var
let db;
// create connection to Indexeddb db and call it budget_tracker_pwa. Set it to version 1
const request = window.indexedDB.open("budget_tracker_pwa", 1);

//
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  //create a new object store called new_transaction, set it to have autoincrement key
  db.createObjectStore("budget_tracker_pwa", { autoIncrement: true });
};

// if successful
request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above), save reference to db in global variable
  db = event.target.result;

  // check if app is online, if yes run checkDatabase() function to send all local db data to api
  if (navigator.onLine) {
    uploadTransaction(db);
  }
};
// if unsuccessful
request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

// will execute if user wants to create a new transaction w/out internet connection
function saveRecord(record) {
  const transaction = db.transaction(["budget_tracker_pwa"], "readwrite");

  //object store for a new transaction
  const transactionObjectStore = transaction.objectStore("budget_tracker_pwa");

  // add record to your store with add method.
  transactionObjectStore.add(record);
}

function uploadTransaction() {
  // open a transaction on your pending db
  const transaction = db.transaction(["budget_tracker_pwa"], "readwrite");

  // access your pending object store
  const transactionObjectStore = transaction.objectStore("budget_tracker_pwa");

  // get all records from store and set to a variable
  const getAll = transactionObjectStore.getAll();

  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          //another one
          const transaction = db.transaction(
            ["budget_tracker_pwa"],
            "readwrite"
          );
          const transactionObjectStore =
            transaction.objectStore("budget_tracker_pwa");
          // clear all items in your store
          transactionObjectStore.clear();

          alert("All transactions have been successfully entered!");
        })
        .catch((err) => {
          // set reference to redirect back here
          console.log(err);
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", uploadTransaction);
