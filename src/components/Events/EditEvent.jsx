import {
  Link,
  redirect,
  useNavigate,
  useParams,
  useSubmit,
  useNavigation,
} from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { editEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const submit = useSubmit();
  const { state } = useNavigation();

  const { data, isError, error, isPending } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  // //useMutation method.
  // const { mutate } = useMutation({
  //   mutationKey: ["events", id],
  //   mutationFn: editEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event; //the data from the mutate fcn

  //     await queryClient.cancelQueries({ queryKey: ["events", id] }); //promise
  //     // cancel, so nobody is requesting the data.

  //     const previousEvent = queryClient.getQueryData({
  //       queryKey: ["events", id],
  //     });

  //     queryClient.setQueryData(["events", id], newEvent);

  //     return { previousEvent };
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(["events", id], context.previousEvent);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ["events", id] });
  //   },
  // });

  function handleSubmit(formData) {
    // mutate({ id, event: formData }); ////useMutate method
    // navigate("../");
    submit(formData, { method: "POST" }); //method anything but get triggers action.
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="An error"
          message={error.info?.message || "Something went wrong"}
        />
        <Link to="../" className="button">
          Back
        </Link>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (
          <p>Sending data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });
}

export async function action({ params, request }) {
  const formData = await request.formData(); //builtin method(router), get hold of submitted data.
  const updatedEventData = Object.fromEntries(formData); // transforms formData to simple key-pair obj.
  await editEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries({ queryKey: ["events"] });
  return redirect("../");
}
