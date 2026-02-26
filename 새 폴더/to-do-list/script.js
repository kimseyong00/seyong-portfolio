// 🌙 포트폴리오 메인에서 전달된 theme 파라미터만 인식
const params = new URLSearchParams(window.location.search);
const theme = params.get("theme");

document.body.classList.remove("dark"); // 항상 초기화

if (theme === "dark") {
  document.body.classList.add("dark");
}


const input = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const countDisplay = document.getElementById("count");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

// 남은 할 일 카운트 업데이트
function updateCount() {
  const remaining = todos.filter(t => !t.completed).length;
  countDisplay.textContent = `남은 할 일: ${remaining}개`;
}

// 저장
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// 렌더링
function renderTodos() {
  todoList.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" ${todo.completed ? "checked" : ""}>
      <span>${todo.text} <small style="color:#888;">(${todo.date})</small></span>
      <button class="deleteBtn">삭제</button>
    `;

    // 체크박스
    li.querySelector("input").addEventListener("change", e => {
      todos[index].completed = e.target.checked;
      saveTodos();
      renderTodos();
    });

    // 삭제 버튼
    li.querySelector(".deleteBtn").addEventListener("click", () => {
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    });

    if (todo.completed) li.classList.add("completed");
    todoList.appendChild(li);
  });
  updateCount();
}

// 추가
addBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return alert("할 일을 입력하세요!");

  const newTodo = {
    text,
    completed: false,
    date: new Date().toLocaleString()
  };
  todos.push(newTodo);
  saveTodos();
  renderTodos();
  input.value = "";
});

// 초기 렌더링
renderTodos();
