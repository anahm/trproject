#!/usr/bin/python

"""
translate.py
6.30.12

accessing msoft translator api

"""

import urllib, urllib2
import json

from xml.etree import ElementTree as ET

""" wrapper method for everything """
def power_translate (text, lang1, lang2):
    token = get_access_token()
    xml_translate = translate(token, text, lang1, lang2)
    string_translate = xml_to_string(xml_translate)
    return string_translate

""" takes xml string --> just inner text  """
def xml_to_string (xml):
    element = ET.XML(xml)
    return element.text

""" get access token to log into translate api """
def get_access_token ():

    client_id = '000000004C0C1D03'
    client_secret = 'hNmB1qpTCKT6p5mHeIJO38YOM80v1pUH'

    data = urllib.urlencode({
            'client_id' : client_id,
            'client_secret' : client_secret,
            'grant_type' : 'client_credentials',
            'scope' : 'http://api.microsofttranslator.com'
            })

    try:
        request = urllib2.Request('https://datamarket.accesscontrol.windows.net/v2/OAuth2-13')
        request.add_data(data) 

        response = urllib2.urlopen(request)
        response_data = json.loads(response.read())

        if response_data.has_key('access_token'):
            return response_data['access_token']

    except urllib2.URLError as e:
        if hasattr(e, 'reason'):
            print "Fail connection to server"
        elif hasattr(e, 'code'):
            print "Server fail"
    except TypeError:
        print "Server data sucks"

supported_languages = { # as defined here: http://msdn.microsoft.com/en-us/library/hh456380.aspx
    'ar' : ' Arabic',
    'bg' : 'Bulgarian',
    'ca' : 'Catalan',
    'zh-CHS' : 'Chinese (Simplified)',
    'zh-CHT' : 'Chinese (Traditional)',
    'cs' : 'Czech',
    'da' : 'Danish',
    'nl' : 'Dutch',
    'en' : 'English',
    'et' : 'Estonian',
    'fi' : 'Finnish',
    'fr' : 'French',
    'de' : 'German',
    'el' : 'Greek',
    'ht' : 'Haitian Creole',
    'he' : 'Hebrew',
    'hi' : 'Hindi',
    'hu' : 'Hungarian',
    'id' : 'Indonesian',
    'it' : 'Italian',
    'ja' : 'Japanese',
    'ko' : 'Korean',
    'lv' : 'Latvian',
    'lt' : 'Lithuanian',
    'mww' : 'Hmong Daw',
    'no' : 'Norwegian',
    'pl' : 'Polish',
    'pt' : 'Portuguese',
    'ro' : 'Romanian',
    'ru' : 'Russian',
    'sk' : 'Slovak',
    'sl' : 'Slovenian',
    'es' : 'Spanish',
    'sv' : 'Swedish',
    'th' : 'Thai',
    'tr' : 'Turkish',
    'uk' : 'Ukrainian',
    'vi' : 'Vietnamese',
}

""" printing all supported languages """
def print_slangs ():

    codes = []
    for k,v in supported_languages.items():
        codes.append('\t'.join([k, '=', v]))
    return '\n'.join(codes)

def to_bytestring (s):
    """Convert the given unicode string to a bytestring, using utf-8 encoding,
    unless it's already a bytestring"""

    if s:
        if isinstance(s, str):
            return s
        else:
            return s.encode('utf-8')

def translate (access_token, text, to_lang, from_lang=None):
    """Use the HTTP Interface to translate text, as described here:
    http://msdn.microsoft.com/en-us/library/ff512387.aspx
    and return an xml string if successful
    """

    if not access_token:
        print 'Sorry, the access token is invalid'
    else:
        if to_lang not in supported_languages.keys():
            print 'Sorry, the API cannot translate to', to_lang
            print 'Please use one of these instead:'
            print print_supported_languages()
        else:
            data = { 'text' : to_bytestring(text), 'to' : to_lang }

            if from_lang:
                if from_lang not in supported_languages.keys():
                    print 'Sorry, the API cannot translate from', from_lang
                    print 'Please use one of these instead:'
                    print print_supported_languages()
                    return
                else:
                    data['from'] = from_lang

            try:

                request = urllib2.Request('http://api.microsofttranslator.com/v2/Http.svc/Translate?'+urllib.urlencode(data))
                request.add_header('Authorization', 'Bearer '+access_token)

                response = urllib2.urlopen(request)
                return response.read()

            except urllib2.URLError, e:
                if hasattr(e, 'reason'):
                    print datestring(), 'Could not connect to the server:', e.reason
                elif hasattr(e, 'code'):
                    print datestring(), 'Server error: ', e.code
