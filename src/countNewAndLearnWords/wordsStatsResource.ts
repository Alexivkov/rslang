import { getUser } from '../services/requests';
import { AggregatedWordsResponse, IUsersStats, UserWord } from '../sprint/script/dataTypes';
import { BASE_URL, getFormattedTodayDate } from '../services/constants';

const wordsStatsResource = {

  // проверка есть ли слово в списке пользователя
  async checkWordIsInUserWordsList(wordId: string): Promise<UserWord | undefined> {
    const user = await getUser();
    const rawResponse = await fetch(`${BASE_URL}users/${user?.userId}/words/${wordId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user?.token}`,
        Accept: 'application/json',
      },
    });
    if (rawResponse.ok) {
      return rawResponse.json();
    }
    if (rawResponse.status === 404) {
      return undefined;
    } // TODO: process no auth error?
    return undefined;
  },

  // обновить кол-во правильных ответов на слове в долгосрочной статитстике
  async updateWordInUsersWordsList(word: UserWord): Promise<UserWord> {
    const user = await getUser();
    const wordDataToPost = {
      optional: word.optional,
      difficulty: word.difficulty,
    };
    const rawResponse = await fetch(`${BASE_URL}users/${user?.userId}/words/${word.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user?.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wordDataToPost),
    });
    return rawResponse.json();
  },

  // добавляем слов
  async addWordToUsersList(wordId: string, countRightAnswersInRow = 0): Promise<UserWord | undefined> {
    const user = await getUser();
    const rawResponse = await fetch(`${BASE_URL}users/${user?.userId}/words/${wordId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user?.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        difficulty: 'weak',
        optional: {
          countRightAnswersInRow,
          isLearned: false,
          dateAdded: getFormattedTodayDate(),
        },
      }),
    });
    return rawResponse.json();
  },

  async createUsersStat(): Promise<void> {
    const user = await getUser();
    await fetch(`${BASE_URL}users/${user?.userId}/statistics`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user?.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        learnedWords: 0,
        optional: {},
      }),
    });
  },

  async getOrCreateUsersStat(): Promise<IUsersStats> {
    const user = await getUser();
    const rawResponse = await fetch(`${BASE_URL}users/${user?.userId}/statistics`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user?.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (rawResponse.status === 404) {
      await this.createUsersStat();
      return this.getOrCreateUsersStat();
    }
    return rawResponse.json();
  },

  async setUsersStat(stats: IUsersStats): Promise<void> {
    const user = await getUser();
    const rawResponse = await fetch(`${BASE_URL}users/${user?.userId}/statistics`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user?.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stats),
    });
    return rawResponse.json();
  },

  async getCountOfTodayLearnedWords(): Promise<number> {
    const token = JSON.parse(<string>localStorage.getItem('user'))?.token;
    const userId = JSON.parse(<string>localStorage.getItem('user'))?.userId;

    const url = new URL(`${BASE_URL}users/${userId}/aggregatedWords`);

    const params = [['page', '1'],
      ['wordsPerPage', '1'],
      ['filter',
        JSON.stringify({
          $and: [{ 'userWord.optional.dateLearned': getFormattedTodayDate(), 'userWord.optional.isLearned': true },
          ],
        }),
      ],
    ];
    url.search = new URLSearchParams(params).toString();

    const rawResponse = await fetch(`${url}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (rawResponse.ok) {
      const resp = await rawResponse.json() as AggregatedWordsResponse[];
      return (resp[0].totalCount[0]?.count || 0) as number;
    }
    return 0;
  },

  async getAllLearnedWords(): Promise<UserWord[]> {
    const token = JSON.parse(<string>localStorage.getItem('user'))?.token;
    const userId = JSON.parse(<string>localStorage.getItem('user'))?.userId;

    const url = new URL(`${BASE_URL}users/${userId}/aggregatedWords`);

    const params = [['page', '1'],
      ['wordsPerPage', '1'],
      ['filter',
        JSON.stringify({
          'userWord.optional.isLearned': true,
        }),
      ],
    ];
    url.search = new URLSearchParams(params).toString();

    const rawResponse = await fetch(`${url}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (rawResponse.ok) {
      return rawResponse.json();
    }
    return [];
  },

  async getUserWordsList(): Promise<UserWord[]> {
    const user = await getUser();
    const rawResponse = await fetch(`${BASE_URL}users/${user?.userId}/words`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user?.token}`,
        Accept: 'application/json',
      },
    });
    if (rawResponse.ok) {
      return rawResponse.json();
    }
    return [];
  },
};

export default wordsStatsResource;
