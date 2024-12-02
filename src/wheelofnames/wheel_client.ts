export class WheelOfNamesClient {
  private readonly url: string
  private readonly apiKey: string
  constructor() {
    this.url = 'https://wheelofnames.com/api/v1/wheels/shared'
    this.apiKey = process.env.WHEEL_API_KEY
  }

  async generateWheel(guildName: string, usernames: string[]) {
    const wheel = {
      shareMode: 'copyable',
      wheelConfig: {
        title: guildName,
        description: 'Randomly select players for the next match',
        entries: usernames.map((username) => ({ text: username })),
      },
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    }

    const response = await fetch(this.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(wheel),
    })

    const jsonResponse = await response.json()

    if (!jsonResponse?.data?.path) {
      throw new Error('Response not OK')
    }

    const path = jsonResponse.data.path
    return `https://wheelofnames.com/${path}`
  }
}
