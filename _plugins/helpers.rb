# frozen_string_literal: true

require 'liquid'
require 'digest'
require 'countries'

##
# Adds filters to use in the templates.
module Helpers
  def country_emoji_flag(code)
    ISO3166::Country.new(code.to_s)&.emoji_flag || code
  end
end

Liquid::Template.register_filter(Helpers)
