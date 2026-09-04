export type GrammarQuestion = {
  q: string;
  o: string[];
  /** chỉ số đáp án đúng, bắt đầu từ 0 */
  a: number;
  why: string;
};

export type GrammarTopic = {
  id: string;
  order: number;
  name: string;
  l: string;
  qs: GrammarQuestion[];
};
