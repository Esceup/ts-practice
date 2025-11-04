export interface Candidate {
      id: number,
      name: string,
      vacancy: string,
      phone: string,
}

export interface CandidatesData {
    allCandidates: {
        [letter: string]: {
            [id: number]: Candidate;
        }
    }
}