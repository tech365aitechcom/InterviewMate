import { create } from "zustand";

export const useInterviewStore = create((set) => ({
  jobRole: "",
  questions: [],
  answers: {},
  feedback: {},

  setJobRole: (role) => set({ jobRole: role }),
  setQuestions: (questions) => set({ questions }),
  setAnswer: (id, answer) =>
    set((state) => ({ answers: { ...state.answers, [id]: answer } })),
  setFeedback: (feedback) => set({ feedback }),
}));
