require 'sinatra/base'
require 'sinatra/json'
require 'sinatra/namespace'

class AbiturientStat < Sinatra::Base
  register Sinatra::Namespace
  helpers Sinatra::JSON

  namespace '/backend' do
    get '/' do
      json hello: 'world'
    end
  end

  configure :development do
    require 'sinatra/reloader'
    register Sinatra::Reloader

    set :public_folder, './public'
  end
end
