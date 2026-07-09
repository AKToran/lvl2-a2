export interface IIssue {
  title: string;
  description: string;
  type: string;
}

export interface IQuery {
  sort?: string;
  type?: string;
  status?: string;
}