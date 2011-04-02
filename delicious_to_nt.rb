#!/usr/bin/env ruby

require 'nokogiri'
require 'rdf'
require 'rdf/ntriples'

if ARGV.length == 0
  puts "Please provide the name of the input and output files."
  puts "Example: delicious_to_nt.rb delicious.html delicious.nt"
  exit
end

inFile = ARGV.shift
if !File.exists?(inFile)
  puts "The file you specified does not exist."
  exit
end

include RDF

BASE_URI = RDF::URI.new('http://dydra.com/jhuckabee/bookmarks')
RSS = RDF::Vocabulary.new("http://purl.org/rss/1.0/")
TAGS = RDF::Vocabulary.new("http://www.holygoat.co.uk/owl/redwood/0.1/tags/")

tags = {}
RDF::NTriples::Writer.open('bookmarks.nt') do |writer|
  writer << RDF::Graph.new do |graph|
    resource = nil
    File.readlines(inFile).each do |line|
      if line =~ /\<DT\>/ 
        # Parse link
        el = Nokogiri::HTML(line).xpath('//a').first
        resource = RDF::URI.new(el.attributes['href'].value)
        graph << [resource, RDFS.a, RSS.item]
        graph << [resource, DC.title, el.children.first.to_s]
        el.attributes['tags'].value.split(',').collect{|tag| tag if tag.length > 0}.compact.each do |tag|
          if tags[tag].nil?
            tags[tag] = BASE_URI / ("##{tag}")
            graph << [tags[tag], RDF.type, TAGS.Tag]
            graph << [tags[tag], TAGS.tagName, tag]
          end
          graph << [resource, TAGS.taggedWithTag, tags[tag]]
        end
        graph << [resource, TAGS.taggedOn, RDF::Literal.new(Time.at(el.attributes['add_date'].value.to_i), :datatype => XSD.datetime)]
      elsif line =~ /\<DD\>/
        # Add comment
        graph << [resource, RDFS.comment, line.gsub('<DD>', '').chomp]
      end
    end
  end
end
