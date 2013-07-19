require 'sinatra/base'
require 'sinatra/json'
require 'sinatra/namespace'

require 'open-uri'

class AbiturientStat < Sinatra::Base
  register Sinatra::Namespace
  helpers Sinatra::JSON

  namespace '/backend' do
    get '/table' do
      url = "http://abitur.bsuir.by/stat/budjet.jsp"
      page = open(url)
      source = page.read.scan(/<table cellspacing="0" align="center">.*<\/table>/m)[0]
      parameters = page.content_type_parse

      source.encode('UTF-8', invalid: :replace, undef: :replace, replace: '')
    end
  end

  configure :development do
    require 'sinatra/reloader'
    register Sinatra::Reloader

    set :public_folder, './public'
  end
end
