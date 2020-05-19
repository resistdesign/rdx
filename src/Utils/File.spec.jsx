import expect from 'expect.js';
import {createFsFromVolume, Volume} from 'memfs';
import {includeParentLevels} from '../../TestUtils';
import File from './File';

const FAKE_DIRECTORY = '/lots/';
const FAKE_FILE_LIST = [
  '/lots/of/really/fake',
  '/lots/of/really/fake/files',
  '/lots/of/really/fake/files/here.jsx'
];

let CAPTURED_GLOB_SEARCH_OPTIONS,
  BASE_VOL,
  FILE_SYSTEM,
  FILE_INSTANCE: File;

const globSearch = async (options = {}) => {
  CAPTURED_GLOB_SEARCH_OPTIONS = options;

  return FAKE_FILE_LIST;
};

const beforeEach = () => {
  CAPTURED_GLOB_SEARCH_OPTIONS = undefined;
  BASE_VOL = new Volume({});
  FILE_SYSTEM = createFsFromVolume(BASE_VOL);
  FILE_INSTANCE = new File({
    cwd: FAKE_DIRECTORY,
    globSearch,
    fileSystem: FILE_SYSTEM
  });
};

export default includeParentLevels(
  __dirname,
  {
    File: {
      beforeEach,
      'should be a class': () => {
        expect(File).to.be.a(Function);
      },
      'should assign properties on construction': () => {
        expect(FILE_INSTANCE.cwd).to.be(FAKE_DIRECTORY);
        expect(FILE_INSTANCE.globSearch).to.be(globSearch);
        expect(FILE_INSTANCE.fileSystem).to.be(FILE_SYSTEM);
      },
      listDirectory: {
        'should recursively list all files in a directory': async () => {
          const fileList = await FILE_INSTANCE.listDirectory({
            directory: FAKE_DIRECTORY
          });
          const {
            pattern,
            cwd
          } = CAPTURED_GLOB_SEARCH_OPTIONS;

          expect(fileList).to.equal(FAKE_FILE_LIST);
          expect(pattern).to.equal(`${FAKE_DIRECTORY}**/*`);
          expect(cwd).to.be(FAKE_DIRECTORY);
        }
      },
      readFile: {
        'should read a utf8/text file': async () => {
          const fullPath = '/lots/thing.txt';
          const path = 'thing.txt';
          const data = 'This is my file song!!!... Take back my smile song!!!... 🎶';

          BASE_VOL.fromJSON({
            [fullPath]: data
          });

          const readFileData = await FILE_INSTANCE.readFile({
            path,
            binary: false
          });

          expect(readFileData).to.be(data);
        },
        'should read a binary file': async () => {
          const fullPath = '/lots/icon.png';
          const path = 'icon.png';
          const dataString = `
iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAAL
EwEAmpwYAAAFGmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJl
Z2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1w
bWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1Q
IENvcmUgNi4wLWMwMDIgNzkuMTY0MzUyLCAyMDIwLzAxLzMwLTE1OjUwOjM4ICAg
ICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5
OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjph
Ym91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8i
IHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1s
bnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAv
IiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIg
eG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9S
ZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3Ag
MjEuMSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjAtMDMtMDFUMjA6
NTU6MzQtMDU6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTA1LTA5VDE5OjEwOjAy
LTA0OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTA1LTA5VDE5OjEwOjAyLTA0
OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0i
MyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBN
TTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjdkZGJiNWU0LTE2ZDYtNDgzZC04OTJmLTYz
MWIyNjlkN2NhOSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3ZGRiYjVlNC0x
NmQ2LTQ4M2QtODkyZi02MzFiMjY5ZDdjYTkiIHhtcE1NOk9yaWdpbmFsRG9jdW1l
bnRJRD0ieG1wLmRpZDo3ZGRiYjVlNC0xNmQ2LTQ4M2QtODkyZi02MzFiMjY5ZDdj
YTkiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0
aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjdkZGJiNWU0
LTE2ZDYtNDgzZC04OTJmLTYzMWIyNjlkN2NhOSIgc3RFdnQ6d2hlbj0iMjAyMC0w
My0wMVQyMDo1NTozNC0wNTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUg
UGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPC9yZGY6U2VxPiA8L3htcE1N
Okhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBt
ZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+iUN47wAAEN5JREFUeJztnXt8VMXZx7+T
OyGwgEpfgbUiJBaVV9EiXrCGSyEEqKKoFRW1ulVY2wIVlOJbxBdaLxUvr0ehBz9Y
qdgiKpigARGwlgpeAAuvKDSKHBBtLiQEQsht+sdscHPZPbubveac7+fDP+c858xD
5rczc2aeeUZIKbGxLkmxdsAmttgCsDi2ACyOLQCLYwvA4tgCsDi2ACyOLQCLYwvA
4tgCsDi2ACyOLQCLYwvA4tgCsDi2ACyOLQCLYwvA4tgCsDi2ACyOLQCLkxKQ1RLx
Q2CPcHEksu7YhJNAAn4DagGEi4+AXKlzTnudsokvRCAqEUIAIHVuA5KFi+cj65ZN
OAioboMRAIDUuQkYD7iFi7J2+GcTYcLWBXgjXLwE/BXYLnXGhuCXTRwRdAvQhNTJ
A14DXgKmCxdHw+6dTbuISBfQrACdXGA1UIHqEgqDcdAmskSkC/BGuNgEjAKygAKp
s1Lq9GnPO23ChGbkBGLWrhagCakzEHgHOA2oAh4ANOGiIRAnbMKIZqQA1wBr5dQ+
lWbmYZkJFC52ApcBB4EuwFPAx54uwiZaaEYfYA5QiNtpWvkQphagCalzBrAB6Edq
FtQdBXgduFe4+CKgl9i0QkqZJYTwP8jWjKuAq4EpuJ01nudM3x1WAQBInV7AWhzZ
5yFSoGI3QC3wJLDAnk4ODinlAKBeCLG3TQPNyAIeBRzA7bidtV7Pmr4/7ItBwsXX
wHAq935Ecjr0mwSQBswCvpA6M6ROp3CX2xGRUk4C0v1U/hXAJ6i/72Tvyg+UiKwG
ChclwEjKdmzm8E64Qof0HgCnAI8Dn0udO6Ue4GKUxZBS9pBS6sBOIcSOVgaakYVm
PAW8CxQCLtzOkAbcYe8CvJE6mcAbOHJGkLsMts0D401vkz3AXGCFcNEYUiEdDCll
PupvcosQYk8rA83IBxYBTuB3uJ1z/LzLtLyICgBA6qQBK+nSdzxj1sGhTbD1Xqht
NkjdDTyEhYUgpXQAfwBygVFCiC+bGWiGE1gITPRcmY3b+bDJO03LjbgAADxN/Z/o
3GcSeUWqO/jHPbDvtZamu4H/BV4RLurbVWgCIaW8BngGKAfyhBAHTt7UjDRgBvA/
QKbn6lTczucCeK9p2VERAIDUSQaeJeO0nzNmLZwyCPYXwpbpcORfLc2LgYeBF4WL
oAc2iYKUsj/wBDAO2A6MFkKUnDTQjJ+gWoVsz5VG1Ej/xQDfb2oTNQEASB0BPE6a
Yzp5RdDzEmishZ0LYceCpnkDbw6hPh8XdaTPRyllFmrCZgZqBL8F9ctX/aJmDEQ1
9yO9HqsDJuF2rgyiHFObqAqgCakzj5TM3zK6EE4fpi5Wfw1bZ0Lxy0ArnypRA5+n
PZ+ZCYmUUgA3Ao8BvTyXNwLjhBDVaEZfYB5wM+D9Rz8OXIfbuSbI8kxtYiIAAKkz
k+T0RxnxCpwx/rsbJR/AB/epwWJr6oC/AE8KF9vC7lQEkVLmAo8AF3tdLgCuE88e
6IZaP7kLSG3xaBVwNW7nhhDKNLWJmQAApM4UktI0rnxB0O/G5jcPrIUPZ0PZdl+P
/w3VPayO5y8HKeUg4PfA6Ba3Xh5dUDptnVHzC2A60LmNxyuB0bidW0Ms29QmpgIA
T4iZSH6RoYuTOPuO1gZfrICPH4DKtifDQC1ExVtAipQyG5gPXN/yXk2DfNGhf/15
baOcgZoca4tSYDhu5852+GBqE3MBAEidq0Gs4NInUzn3l20YNMC//gyfPAoVn7b1
iueFizsj6mSASCnPQU173wwkt7y/zqjZmldQ+gOp5u59cRBV+a0ngoLzxdQmLgQA
IHVGA6/zwwWduOA3vqxUi7BjAZS3+mFcK1y0mliIFlLKgaiR/fU0H8Cd5JHtVbX3
v1+ZZvKqYuDHuJ1fmtgF4pOpTdwIAEDqXAm8wfn3d2Xw7/0bf7VaCaHkw6Yr5cB/
CxcHI+tlc6SUg1EVf5U/u9lbKnl4W5XZ6/4fyMPtPGBmGKBvpjZxJQAAqTMEWMOA
Kadw+bPmD3zzHvzzMTDWgGxcD4wSrtbfkWH1UcokYCwwE7jCzH7q3yp4bpfpEGU7
asBXYmYYKAkpADgZYrae7Mk9+dFSEAEsWlbugZ2Pw5evzhaTy/zOkYfsl5SdgFuA
XwOmMXeNEm7fUM6Ln1ebmW5B/fIDiuIJlIQVAIDU6Q9sou/E3gxbDkktP499UFMK
J8qX4MiZ12xOvT2+SNkHuBv1nX5qIM/UNUomvV3OyuLjZqYbgXG4naYqCZaEFgCA
1HECG3Hm92PESkgJKo6kAVi19LNjb/9sw+E/4nYG3S14Jm/uQYVatRrR++J4vWTi
2jLe/KrGzLQANcN3IljfAiHhBQAgdU4H1tFr+Hn8+HVI7Rr0O/ZU1J/Y/M2JVfur
GmY8eLHD71SylLILcBPgBs4LtqwjtY1MeKuMDQdN6/Rl4LZQongCpUMIAEDqnAas
oeeQweQVQVq3kN5TXS/l5kMnPv+qquEh17lZLzcrQ8qLUU38DbQ9K2dKxYlG8gpL
2fqtaZ0uAe4ONYonUDqMAACkjgMopMfAoeRvgIyAumKf7KmoP7a9tPbVMWdkbO+a
lnQbcH573lda08jw1SXsLKszM30KmB5KlxQsHUoAcDLEbDWO7JHkb4TOvWPtEgAH
jzUwbFUJeytNY1gW4HY+EA2fIEZRwZFEuKgGxlK5t4DCoXCkONYuUVxZz9DXAqr8
2dGs/EBJKAEAeCKEJlC1bzlrcuHwrpj5squ8jtzVJeyrMq38qWbxe7EioboAbzwh
ZhoZp91FXhGcemFUy99WUkdeYQklx/2uRDeiRvrLouRWMzpcF+CNZ+PpFGpKFvLm
cPj3+1Er+/1vahm+2rTy64DrY1X5gZKwLYA3UucRUjJnNQsxixAbD55g3JpSquv9
/t2OAxNxO9/0ZxRpOnQL0IRnjmAk9dXwVh7sL4hYWQX7asgrMK38I6ip3ZhWfqAk
tAA8ySg2AGoA0FgL6ydC8fKwl7V8bzUTi8qobfRb+RXAqFDi92JFwnYBUudMYD3Q
r9VNkQxDF8HZ4QkSWvLpMe5+9zAN/v9U7Q7hCjcdbiKoCamTjVpF8z0TJJLg2l3Q
bUC7ytp9uI7z/vIt/n/4HASG4Xb6DFyMBR1yDOCJFfgHfis/GYYubnflAwzonsri
K7uT7Ps3UAwMjbfKD5SEagE80UJFQDefRklpcOXSprwEYWP53mpuf+dwyzHALmBM
uEK4wk2H6gKkznBUuhnf68FJaTByZfONJmGkYF+N90BwGyqKJ2whXOGmw3QBUicf
lQjBd+WnZMKYoohVPsD4MzMoGn8qmSkC4J14rvxAifsWQOpciwqe8B0TluaAvLeg
56VR8en9b2oZU1hKZW3jQuDeaCzthkLCdwFS5xbgBfy1VBmnEeO1gMWAO9LBHaGQ
0AKQOlMA/3HhnfuoX373oCO3wsKu8jrGFJZy4GjDclSSprgSQcIKQOrcj9pQ6Zsu
Z8KY9dC19TxQNCmurGfkG6Xsq6ovQM3/x01Ci4QUgNSZj9pp4xtHNnEaEbQeuCoS
Id6hkFAC8GQPeQL4lV/DHgMJR0wg8Al1R17AeGsQpwy6FkdOSIGgTXjFBP4dtRgU
1k0eoZAwAvAEdywCkx2+PYfQnqhg4BjqsIvFQogPmvnw2ZKfknXGXL53+dmkZIb0
H/aKCv4QGBvrz8SEEIAnjdwLqNQpvuk1nFD3BaBm7DTgJSGE3x2a8uMHe5F1xkK+
d/nVOHLSgy3Ia1/ALtTK4KFQHA4HcS8AqZMOvII6g8g3znxC3RkEPCOE2BSCb4JL
npzGD34+jJRO+YS2M6gYtUhkBFt+OIhrAXhCvAsB/yE8fScS1N5AtSy7GFgUzr2B
VXXyV3WNckaP9KSAZk+99gYeBHJxO1vlwos0cSsAzyaPIuASv4bZkwl4d7BKO/s4
sEwIYbojMxTOWnZoxMg+6W//+oIuIqebeZpjr93B/wZGRjtWIC4F4AnhWgsM8ms4
YAoB5QeA91Bp19YIISKfLEoz5icJ5oz9fgYzB3XhitPNhwme/ABlqIFhSAmfQiHu
BOAJ4SoCzvVreP79mGYIUYdVLRBCfGhmGFY0IxXYDAwGGNwzjTkXdeGqvv7HJ54M
IUeAn+B2vht5R+NMAFKnL/A2bYVweTP44VrOv89XHh0JrEBVfOxCrzSjP7ADr02k
A09JZc5FXbi+f2bbCYKA331cxZytlceBCbidayPtZtwIQOrkoII3/UzdiUrGFH1G
71FD2rjZAPwZeFQI0WaasKijGXcCesvL53RPZdaFXbg5J7PNKKKn/3mUaX+vqJNq
z8CqSLoYFwLwhHBtwHdmjTKS0hZya+XZJGdMbuP+CuABn6dmxBLNeBV1Qlcrsh0p
zB/i4Pr+rbuG53cf465NhxsbJJNxO1+KlHsxDwjxhHC9R9uVfwyYT+9R5/CzE+e1
UflrgQuFEDfEZeUrrgMmoLKWNmNvZT03rCvjwhXfss5oninkjgGdWTayR1JakliG
ZkyJkq9tErEWwBPCtQp1jJw3dajv9PncKStoPRH0AXBfKJM3MUUzLgSmAT+ljeCV
3N7pPHKpg4t7fje8KdhXw3VryzjRIGfhdj4Wbpdi1gV4DpV+BZodDiVR/fhc4eJL
KWXLiaCvUWnXXhZCxGWETUBoRi/gF8AUWmQDFcCN2Zk8dpmDXp3VxKLXVrOHcDvn
htOVWB0bNxFYTvNfwXpghueAyabjUZomgmpRufEXmJ6Nl0hoRldUZrHpwH9538pK
Fcy5qCszLsgiLUmw5dta8grCH2IWdQFIncnAUr4bW+xFHRr5hpdT3hNBhcB0IUTU
p0mjhjryZTJwH9Df+1Z/RwpPXN6NcWdmsL20jtEFJZQcb/wjKp9Au6OLoiqAFiFc
1aizfxZ6H/niybdXBPQA7hFCxCy3b9TRjCRUHuHfAs12rFxzViee+VE3ymvUcrIn
xOxW3M52nZsUNQG0COFaiWrum62ASSn7AuuATcC9J49HsRo+hOBIS+IPlznI7Z3O
qIJSvjzS/hCzqAhA6iwAfgMYwN3CRatt0VLKHGAZME8IkRDbpiPOd0J4EDi76XL+
9zOYO7grt6wvZ09F/TuoqeOQQswiKgBPCNeTqBHv/wFz2jq0wZNG/ZeoT7ty08Ks
hjru/VbUYZFOgB7pSTxyqYOndx5lZ1ndZtQiUtAtZsQE4AnhWoz6hLtNuHjPhwMX
AOcIIcK/Yb+joRmdgKnAbDyniEzKzuTTw3XsKK37CMgPNsQsIgLwhHAtRZ1nM8vX
US2eI1NShBC7A/TXBkAzHKgudRqQNqB7KvWNkr2V9btQ6eQDPjUt7AKQOhnAc8Aq
4WK1SeHmZ97b+EYzzkIdGjkhK1VwtE6C2oo+HLdzfyCvCKsAPCFcM1Hn88TldugO
iWbkosZaTalsAw4xC5sAWCIcqGPPXrPSmb5xg2Yko7KXz0etrZQAI8xCzMIpgBzh
ol0nWNmEAc3ojUo2fS3qjKR8fyFmcREPYBMBNGMcap9DN9RWtE1tmcU8HsAmQrid
hai4yhXAm2hGXsjvklKa/rOJYzRjLJqxH82Y0PJWIHVrtwCJjjpRfBBwA5pxU7CP
22OAjoRm3AE04Ha+APYg0JpoxrlAP9zON2wBWBUVjZQjp/b5yMw0sHkAmw6LPQi0
OLYALI4tAItjC8Di2AKwOLYALI4tAItjC8Di2AKwOLYALI4tAItjC8Di2AKwOLYA
LI4tAItjC8Di2AKwOLYALI4tAItjC8Di2AKwOP8BUg5DTt/gos4AAAAASUVORK5C
YII=
`.replace(/\n/gm, m => '');
          const data = Buffer.from(dataString, 'base64');

          FILE_SYSTEM.mkdirpSync(FAKE_DIRECTORY);
          FILE_SYSTEM.writeFileSync(fullPath, data, {encoding: 'binary'});

          const readFileData = await FILE_INSTANCE.readFile({
            path,
            binary: true
          });
          const readFileString = Buffer.from(readFileData, 'binary').toString('base64');

          expect(readFileString).to.be(dataString);
        }
      }
    }
  }
);
