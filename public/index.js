const createTodoItemForm = document.querySelector(".js-createTodoItemForm");
const createTodoItemField = document.querySelector(".js-createTodoItemField");
const todoItemsList = document.querySelector(".js-todoItemsList");

createTodoItemForm.addEventListener("submit", createNewTodoItem);
document.addEventListener("click", handleClicks);

// Initial page load render

const todoItemTemplate = (item) => `
  <li data-id="${item._id}" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
    <span class="item-text">${item.text}</span>
    <div>
      <button class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
      <button class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
  </li>
`;

const todoItems = items
  .map((item) => {
    return todoItemTemplate(item);
  })
  .join("");

todoItemsList.insertAdjacentHTML("beforeend", todoItems);

// Form Validation
function isFieldEmpty(value) {
  if (!value || !value.trim()) {
    // If value == empty string "" or null or string only contains white spaces return true
    return true;
  } else {
    return false;
  }
}

// Clear input field
function clearInputField(field) {
  field.value = "";
}

// Set focus on input field
function setFocusOn(field) {
  field.focus();
}

// Create Feature
function createNewTodoItem(e) {
  e.preventDefault();

  let { value } = createTodoItemField;

  if (isFieldEmpty(value)) {
    // Clear create todo item input field
    clearInputField(createTodoItemField);
    // Set focus of create todo item field after it has cleared
    setFocusOn(createTodoItemField);

    // If true, then stop this whole func.
    return;
  } else {
    axios
      .post("/create-item", {
        text: value,
      })
      .then((response) => {
        // Render the HTML for the new todo item into the DOM
        //addNewTodoItem(todoItemsList, "beforeend", response.data);
        todoItemsList.insertAdjacentHTML(
          "beforeend",
          todoItemTemplate(response.data)
        );
        // Clear create todo item input field
        clearInputField(createTodoItemField);
        // Set focus of create todo item field after it has cleared
        setFocusOn(createTodoItemField);
      })
      .catch(() => {
        console.log("Please try again later.");
      });
  }
}

function handleClicks(e) {
  const isEditBtn = e.target.classList.contains("edit-me");
  const isDeleteBtn = e.target.classList.contains("delete-me");

  // Update feature
  if (isEditBtn) {
    const editBtn = e.target;
    const currentTodo = editBtn.parentElement.parentElement;
    const currentTodoId = currentTodo.dataset.id;
    const currentTodoText = currentTodo.querySelector(".item-text");

    const editedTodoText = prompt(
      "Enter your desired new text:",
      currentTodoText.textContent
    );

    if (editedTodoText) {
      axios
        .post("/update-item", {
          text: editedTodoText,
          id: currentTodoId,
        })
        .then(() => {
          currentTodoText.innerText = editedTodoText;
        })
        .catch(() => {
          console.log("Please try again later.");
        });
    }
  }

  // Delete feature
  if (isDeleteBtn) {
    const deleteBtn = e.target;
    const currentTodo = deleteBtn.parentElement.parentElement;
    const currentTodoId = currentTodo.dataset.id;

    const isAgreeToDelete = confirm(
      "Do you really want to delete this item permanently?"
    );

    if (isAgreeToDelete) {
      axios
        .post("/delete-item", {
          id: currentTodoId,
        })
        .then(() => {
          currentTodo.remove();
        })
        .catch(() => {
          console.log("Please try again later.");
        });
    }
  }
}
