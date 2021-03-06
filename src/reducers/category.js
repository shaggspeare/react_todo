import undoable, { distinctState } from 'redux-undo'
import cloneDeep from 'lodash.clonedeep';
import { createNewCategory, createNewTask } from '../helpers';
import data from '../data';
import {
    ADD_NEW_CATEGORY,
    ADD_NEW_SUBCATEGORY,
    EDIT_CATEGORY,
    DELETE_CATEGORY,
    ADD_NEW_TASK,
    EDIT_TASK,
    MOVE_TASK_TO_NEW_CATEGORY,
    CHECK_COMPLETED
} from '../actions';

const initialState = {
    categoryList: data,
    isShowDoneChecked: false,
};

const category = (state = initialState, action = {}) => {
    let newCategoryList;

    switch (action.type) {

        case ADD_NEW_CATEGORY:
            return Object.assign({}, state, {
                categoryList: [createNewCategory(action.newCategoryTitle, true), ...state.categoryList]
            });

        case ADD_NEW_SUBCATEGORY:
            const newSubcategory = createNewCategory(action.newSubcategoryTitle, false);
            newCategoryList = [newSubcategory, ...state.categoryList.map(category => {
                return category.id === action.categoryToAddSub
                    ? Object.assign({}, category, {subcategories: [newSubcategory.id, ...category.subcategories]})
                    : category
            })];
            return Object.assign({}, state, {categoryList: newCategoryList});

        case EDIT_CATEGORY:
            newCategoryList = state.categoryList.map(category => {
                if(category.id === action.categoryToEdit) {
                    category.title = action.newCategoryTitle
                }
                return category;
            });
            return Object.assign({}, state, {categoryList: newCategoryList});

        case DELETE_CATEGORY:
            newCategoryList = state.categoryList.map(category => {
                if(category.subcategories.includes(action.categoryToDelete)) {
                    category.subcategories = category.subcategories.filter(sub => sub !== action.categoryToDelete);
                }
                return category;
            }).filter(category => category.id !== action.categoryToDelete);
            return Object.assign({}, state, {categoryList: newCategoryList});


        case ADD_NEW_TASK:
            newCategoryList = cloneDeep(state.categoryList).map(category => {
                if(category.id === action.categoryToAddTask) {
                    category.todos = [ ...category.todos, createNewTask(action.newTaskTitle)]
                }
                return category;
            });
            return Object.assign({}, state, {categoryList: newCategoryList});

        case EDIT_TASK:
            newCategoryList = state.categoryList.map(category => {
                category.todos.map(todo => {
                    if(todo.id === action.taskToEdit) {
                        todo.title = action.newTaskTitle;
                        todo.isCompleted = action.isCompleted;
                        todo.description = action.description;
                    }
                    return todo;
                });
                return category;
            });
            return Object.assign({}, state, {categoryList: newCategoryList});

        case MOVE_TASK_TO_NEW_CATEGORY:
            let currentTodo;

            state.categoryList.forEach(category => category.todos.forEach(todo => {
                if(todo.id === action.currentTask) currentTodo = todo;
            }));

            newCategoryList = state.categoryList.map(category => {
                category.todos = category.todos.filter(todo => todo.id !== action.currentTask);
                    return category
                })
                .map(category => {
                    if(category.id === action.categoryToAddNewTask) {
                        category.todos.push(currentTodo);
                    }
                    return category;
                });
            return Object.assign({}, state, {categoryList: newCategoryList});

        case CHECK_COMPLETED:
            if(action.newIsShowDoneChecked) {
                const newCategoryList = cloneDeep(state.categoryList).map(category => {
                    category.todos = category.todos.filter(todo => todo.isCompleted);
                    return category;
                });
                return Object.assign({}, state, {isShowDoneChecked: action.newIsShowDoneChecked, categoryList: newCategoryList});
            }
            return Object.assign({}, state, {isShowDoneChecked: action.newIsShowDoneChecked});

        default:
            return state;
    }
};

const undoableCategory = undoable(category, {
    filter: distinctState()
});

export default undoableCategory;