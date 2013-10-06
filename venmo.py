from requests import get, post

class Venmo(object):
    """A wrapper for the Venmo HTTP API"""
    endpoint = 'https://api.venmo.com'
    def __init__(self, access_token):
        super(Venmo, self).__init__()
        self.scope = 'access_profile,access_friends,make_payments'
        self.access_token = access_token

    def user(self, user_id=None):
        path = self.endpoint + '/me'
        if user_id:
            path = self.endpoint + '/users/' + str(user_id)
        return get(path, params={ 'access_token': self.access_token }).json()['data']

    def friends(self, user_id=None):
        if not user_id:
            user_id = self.user()['id']
        path = self.endpoint + '/users/' + str(user_id) + '/friends'
        return get(path, params={
          'access_token': self.access_token,
          'limit': 1000
        }).json()['data']

    def pay(self, user_id, note, amount, audience='friends'):
        path = self.endpoint + '/payments'
        params = {
            'access_token': self.access_token,
            'user_id': user_id,
            'note': note,
            'amount': amount,
            'audience': audience
        }
        return post(path, params=params).json()

    def charge(self, user_id, note, amount, audience='friends'):
        return pay(user_id, note, '-' + str(amount), audience)
