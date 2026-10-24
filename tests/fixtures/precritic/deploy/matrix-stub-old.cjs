// Self-test stub for a ws-coverage-matrix that predates the document budget (ws-deploy-gates.sh --self-test): its
// --list prints the selection's document count; a real run is never reached in the test (the count is over budget).
if (process.argv.includes('--list')) {
    console.log('  rows reached: 21599 of 21599 print rows (723 skill(s))');
    console.log('  RUN 10922 · PENDING 9000 · N/A 1677 · documents to run 32766');
    console.log('ws-coverage-matrix: list (nothing run)');
    process.exit(0);
}
console.log('ws-coverage-matrix: FAIL - the stub only lists');
process.exit(1);
