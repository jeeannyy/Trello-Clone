import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { useForm } from "react-hook-form";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { ITodo, todoState } from "../atoms";
import DraggableCard from "./DragabbleCard";

interface IWrapper {
  isDragging: boolean;
}

const Wrapper = styled.div<IWrapper>`
  width: 300px;
  padding-top: 10px;
  background-color: ${(props) =>
    props.isDragging ? "#dfe6e9" : props.theme.boardColor};
  border-radius: 5px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease-in-out;
`;

const Title = styled.h2`
  position: relative;
  text-align: center;
  font-weight: 700;
  margin-bottom: 10px;
  font-size: 35px;
  color: #00b894;
`;

interface IAreaProps {
  isDraggingFromThis: boolean;
  isDraggingOver: boolean;
}

const Area = styled.div<IAreaProps>`
  background-color: ${(props) =>
    props.isDraggingOver
      ? "#b2bec3"
      : props.isDraggingFromThis
      ? "#636e72"
      : "transparent"};
  flex-grow: 1;
  transition: background-color 0.3s ease-in-out;
  padding: 30px;
`;

interface IBoardProps {
  todos: ITodo[];
  boardId: string;
  idx: number;
}

const Form = styled.form`
  width: 100%;
  display: flex;
`;

const Input = styled.input`
  flex: 1;
  background: none;
  border: none;
  outline: none;
  padding: 5px 5px;
  text-align: center;
  background-color: #b2bec3;
  &::placeholder {
    color: #2d3436;
  }
  color: #2d3436;
  font-weight: 700;
`;

const Button = styled.button`
  position: absolute;
  right: 2px;
  buttom: 8px;
  background: none;
  border: none;
  outline: none;
  font-size: 18px;
  cursor: pointer;
`;

interface IForm {
  todo: string;
}

const Board = ({ todos, boardId, idx }: IBoardProps) => {
  const { register, setValue, handleSubmit } = useForm<IForm>();
  const setTodos = useSetRecoilState(todoState);
  const onValid = ({ todo }: IForm) => {
    const newTodo = {
      id: Date.now(),
      text: todo,
    };
    setTodos((prev) => {
      const update = {
        ...prev,
        [boardId]: [...prev[boardId], newTodo],
      };
      localStorage.setItem("todo", JSON.stringify(update));
      return update;
    });
    setValue("todo", "");
  };
  const onRemove = () => {
    setTodos(prev => {
      const update = Object.entries(prev).filter(target => target[0] !== boardId);
      const updateList = update.reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
      localStorage.setItem("todo", JSON.stringify(updateList));
      return updateList;
    })
  }
  return (
    <Draggable draggableId={boardId} index={idx}>
      {(provided, snapshot) => (
        <Wrapper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          isDragging={snapshot.isDragging}
        >
          <Title>
            {boardId}
            <Button onClick={onRemove}>🗑</Button>
          </Title>
          <Form onSubmit={handleSubmit(onValid)}>
            <Input
              {...register("todo", { required: true })}
              type="text"
              placeholder={`Add your task`}
            />
          </Form>
          <Droppable droppableId={boardId}>
            {(provided, snapshot) => (
              <Area
                isDraggingOver={snapshot.isDraggingOver}
                isDraggingFromThis={Boolean(snapshot.draggingFromThisWith)}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {todos.map((todo, idx) => (
                  <DraggableCard
                    key={todo.id}
                    todoId={todo.id}
                    todoText={todo.text}
                    idx={idx}
                  />
                ))}
                {provided.placeholder}
              </Area>
            )}
          </Droppable>
        </Wrapper>
      )}
    </Draggable>
  );
};

export default React.memo(Board);