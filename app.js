import * as tortank from 'rdf-tortank-linux-musl';
import { join } from "path";

import { readdirSync, existsSync } from "fs";

const INPUT_DIRECTORY = process.env.INPUT_DIRECTORY || "/share/input";
const OUTPUT_DIRECTORY = process.env.INPUT_DIRECTORY || "/share/output";

// some example data
const data = `
      @prefix foaf: <http://foaf.com/>.
        [ foaf:name "Alice" ] foaf:knows [
          foaf:name "Bob" ;
          foaf:lastName "George", "Joshua" ;
          foaf:knows [
          foaf:name "Eve" ] ;
    foaf:mbox <bob@example.com>] .
`;

// ################ STATEMENTS EXAMPLES ################
// *
// * Example listing statement filtering on subject and predicate
// * You could also use foaf:name as it's a known prefix defined in data
// *
// #####################################################
let params = {
  lhsData: data, // string|undefined, if not provided use lhsPath
  outputType: "n3", // also optional
  subject: undefined, // uri|undefined, to filter subjects (must be an absolute uri)
  predicate: "<http://foaf.com/name>", // rdf iri|undefined, to filter predicates (muts be an absolute uri)
  object: '"Eve"' // rdf string | rdf iri | undefined, to filter objects
};

const ttl = tortank.statements(params);

console.log(ttl); // output as ttl 


// we could also output it to a file directly
const outPathExample1 = join(OUTPUT_DIRECTORY, "example-output-stmt1.ttl");
params.outputFilePath = outPathExample1;

if (tortank.statements(params)) {
  console.log("successfully saved to ", outPathExample1);
}

// we could also load input data from a file

const inputPathExample1 = join(INPUT_DIRECTORY, "merge", "20230321082905-public-triples.ttl");
params.lhsData = undefined; // don't use the data
params.outputFilePath = undefined // in memory
params.lhsPath = inputPathExample1;
params.predicate = "mu:uuid";
params.object = '"dcc01338-842c-4fbd-ba68-3ca6f3af975c"';
params.outputType = "js";

console.log(tortank.statements(params));



// ################ MERGE EXAMPLES #####################
// *
// * example merging a whole directory of turtle files in one single turtle 
// * triples are dedup
// *
// #####################################################

let mergeDirPath = join(INPUT_DIRECTORY, "merge");
let outputFilePath = join(OUTPUT_DIRECTORY, "example-merge.ttl");
params.lhsData = undefined;
params.outputType = "n3";
params.outputFilePath = outputFilePath;
params.bufSize = 10; // buffer output
console.log("start merging...");
for (const filePath of readdirSync(mergeDirPath)) {

  if (!existsSync(outputFilePath)) {
    // we provide an empty right hand side input Data because it's the first time we accumulate
    params.rhsData = "";
    params.rhsPath = undefined;
  } else {
    params.rhsData = undefined;
    params.rhsPath = outputFilePath;
  }
  params.lhsPath = join(mergeDirPath, filePath);

  if (tortank.merge(params)) {
    console.log(`successfully merged ${filePath}`)
  }
  console.log("merge done");

}


// ################ Difference EXAMPLES #####################
// * 
// * difference between two models
// *
// #####################################################

params.lhsPath = join(INPUT_DIRECTORY, "diff", "modelA.ttl");
params.rhsPath = join(INPUT_DIRECTORY, "diff", "modelB.ttl");
params.lhsData = undefined;
params.rhsData = undefined;
params.outputFilePath = undefined;
params.outputType = "js";
console.log("diff between a and b: ", tortank.difference(params));

// ################ Intersection EXAMPLES #####################
// * 
// * similarities between two models
// *
// #####################################################

params.lhsPath = join(INPUT_DIRECTORY, "diff", "modelA.ttl");
params.rhsPath = join(INPUT_DIRECTORY, "diff", "modelB.ttl");
params.lhsData = undefined;
params.rhsData = undefined;
params.outputFilePath = undefined;
params.outputType = "js";
console.log("similarities between a and b: ", tortank.intersection(params));
