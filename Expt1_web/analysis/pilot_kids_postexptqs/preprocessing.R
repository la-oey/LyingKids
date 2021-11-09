setwd("/Users/loey/Desktop/Research/FakeNews/LyingKids/Expt1_web/analysis/pilot_kids_postexptqs/")
library(tidyverse)

raw.jt <- read_csv("raw_coding_Jason.csv")
raw.dw <- read_csv("raw_coding_Diana.csv")

mode <- function(v) {
  uniqv <- unique(v)
  uniqv[which.max(tabulate(match(v, uniqv)))]
}

distinct(raw.jt, Question)

glimpse(raw.jt)
glimpse(raw.dw)

num.subj <- raw.jt %>%
  distinct(SubjID) %>%
  nrow()

# each coder gets their own row
df.long <- raw.jt %>%
  mutate(coder = "JT") %>%
  bind_rows(mutate(raw.dw, coder = "DW")) %>%
  rename(CodeQ = `What is being coded`,
         CodeA = `Code Response`) %>%
  mutate(maybe = str_detect(CodeA, "\\*"),
         CodeA = str_remove(CodeA, "\\*"),
         CodeA = tolower(CodeA),
         CodeQ = case_when(
           CodeQ == "Opponent’s points? Y vs" ~ "Opponent’s points? Y vs N",
           CodeQ == "0 to 6 marbles for themselve" ~ "0 to 6 marbles for themselves",
           TRUE ~ CodeQ
         ),
         CodeQNum = rep(c("1a","1b","1c","1d","2a","2b","2c","2d","2e","3","4"), num.subj*2))
write.csv(df.long, "processedDat_long.csv")

# side by side comparison of coder responses
DW.maybe <- df.long %>%
  filter(coder == "DW") %>%
  select(-c(coder, CodeA))
df.sidebyside <- df.long %>%
  select(-c(Notes, maybe)) %>%
  spread(coder, CodeA) %>%
  left_join(DW.maybe) %>%
  rename(DW.maybe = maybe)
write.csv(df.sidebyside, "processedDat_sidebyside.csv")

# look at cases where coders don't agree
df.disagree <- df.sidebyside %>%
  filter(DW != JT)
write.csv(df.disagree, "processedDat_disagree.csv")

df.disagree2 <- read_csv("processedDat_disagree_LO.csv")

toBoolNum <- function(x){
  case_when(
    x == "n" ~ 0,
    x == "y" ~ 1,
    TRUE ~ as.numeric(x)
  )
}

consensus <- df.disagree2 %>%
  mutate_at(c("DW","JT","LO"), toBoolNum) %>%
  gather("coder","response",c("DW","JT","LO")) %>%
  group_by(SubjID, QuestionNum, CodeQ, CodeQNum) %>%
  summarise(comb = mode(response))


df.consensus <- df.sidebyside %>%
  left_join(consensus) %>%
  mutate(comb = ifelse(is.na(comb), DW, comb),
         comb = case_when(
           comb == "n" ~ "0",
           comb == "y" ~ "1",
           TRUE ~ comb
         )) %>%
  select(-c(DW, JT, DW.maybe))

write.csv(df.consensus, "processedDat_conensus.csv")




